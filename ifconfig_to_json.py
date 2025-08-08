#!/usr/bin/env python3

import json
import re
import shutil
import subprocess
import sys
from typing import Any, Dict, List, Optional


def read_stdin_if_available() -> Optional[str]:
    if sys.stdin is None:
        return None
    try:
        if sys.stdin.isatty():
            return None
    except Exception:
        pass
    data = sys.stdin.read()
    return data if data.strip() else None


def try_run_ip_json() -> Optional[str]:
    if shutil.which("ip") is None:
        return None
    try:
        out = subprocess.check_output(["ip", "-j", "address"], stderr=subprocess.DEVNULL)
        return out.decode()
    except Exception:
        return None


def try_run_ifconfig() -> Optional[str]:
    if shutil.which("ifconfig") is None:
        return None
    try:
        out = subprocess.check_output(["ifconfig", "-a"], stderr=subprocess.DEVNULL)
        return out.decode()
    except Exception:
        return None


def parse_ifconfig(text: str) -> List[Dict[str, Any]]:
    interfaces: List[Dict[str, Any]] = []
    current: Optional[Dict[str, Any]] = None

    def push_current():
        nonlocal current
        if current is not None and current.get("name"):
            interfaces.append(current)
        current = None

    # Normalize Windows line endings if any
    text = text.replace("\r\n", "\n")

    for raw_line in text.splitlines():
        line = raw_line.rstrip("\n")
        if not line.strip():
            continue

        # Interface header typically starts at column 0 and contains a colon
        if not line.startswith(" ") and ":" in line:
            # Some platforms include the index like "2: eth0: ...". Keep the first token up to the first colon as the name candidate
            leading = line.split(":", 1)[0]
            # Strip optional numeric prefix "2: eth0"
            name = leading.split()[-1]
            push_current()
            current = {
                "name": name,
                "mtu": None,
                "mac_address": None,
                "flags": [],
                "txqueuelen": None,
                "ipv4": [],
                "ipv6": [],
                "rx": {},
                "tx": {},
                "raw_header": line.strip(),
            }
            # Parse MTU
            m = re.search(r"\bmtu\s+(\d+)", line)
            if m:
                current["mtu"] = int(m.group(1))
            # Parse flags in <...>
            m = re.search(r"<([^>]+)>", line)
            if m:
                current["flags"] = [f.strip() for f in m.group(1).split(",") if f.strip()]
            continue

        if current is None:
            continue

        # MAC address (modern: ether XX:.. ; legacy: HWaddr XX:..)
        m = re.search(r"\b(?:ether|HWaddr)\s+([0-9A-Fa-f:]{11,})", line)
        if m:
            current["mac_address"] = m.group(1)
            # txqueuelen sometimes appears on same line
            m2 = re.search(r"\btxqueuelen\s+(\d+)", line)
            if m2:
                current["txqueuelen"] = int(m2.group(1))
            continue

        # txqueuelen on separate line
        m = re.search(r"\btxqueuelen\s+(\d+)", line)
        if m:
            current["txqueuelen"] = int(m.group(1))
            continue

        # IPv4 (modern Linux ifconfig)
        m = re.search(r"\binet\s+(\S+)(?:\s+netmask\s+(\S+))?(?:\s+broadcast\s+(\S+))?", line)
        if m:
            current["ipv4"].append({
                "address": m.group(1),
                "netmask": m.group(2) or None,
                "broadcast": m.group(3) or None,
            })
            continue

        # IPv4 (legacy style: inet addr:...  Bcast:...  Mask:...)
        m = re.search(r"\binet\s+addr:(\S+)(?:\s+Bcast:(\S+))?(?:\s+Mask:(\S+))?", line)
        if m:
            current["ipv4"].append({
                "address": m.group(1),
                "broadcast": m.group(2) or None,
                "netmask": m.group(3) or None,
            })
            continue

        # IPv6
        m = re.search(r"\binet6\s+(\S+)(?:\s+prefixlen\s+(\d+))?(?:\s+scopeid\s+(\S+))?", line)
        if m:
            current["ipv6"].append({
                "address": m.group(1),
                "prefixlen": int(m.group(2)) if m.group(2) else None,
                "scopeid": m.group(3) or None,
            })
            continue

        # RX packets line (may include bytes and error stats)
        if "RX packets" in line:
            m = re.search(r"RX packets\s+(\d+)", line)
            if m:
                current["rx"]["packets"] = int(m.group(1))
            m = re.search(r"bytes\s+(\d+)", line)
            if m:
                current["rx"]["bytes"] = int(m.group(1))
            for k in ["errors", "dropped", "overruns", "frame"]:
                mk = re.search(rf"\b{k}\s+(\d+)", line)
                if mk:
                    current["rx"][k] = int(mk.group(1))
            continue

        # TX packets line
        if "TX packets" in line:
            m = re.search(r"TX packets\s+(\d+)", line)
            if m:
                current["tx"]["packets"] = int(m.group(1))
            m = re.search(r"bytes\s+(\d+)", line)
            if m:
                current["tx"]["bytes"] = int(m.group(1))
            for k in ["errors", "dropped", "overruns", "carrier", "collisions"]:
                mk = re.search(rf"\b{k}\s+(\d+)", line)
                if mk:
                    current["tx"][k] = int(mk.group(1))
            continue

        # Legacy RX/TX bytes-only lines
        m = re.search(r"\bRX bytes\s+(\d+)", line)
        if m:
            current["rx"]["bytes"] = int(m.group(1))
            continue
        m = re.search(r"\bTX bytes\s+(\d+)", line)
        if m:
            current["tx"]["bytes"] = int(m.group(1))
            continue

    # Push last interface
    push_current()
    return interfaces


def main() -> None:
    # 1) Prefer native JSON if available
    ip_json = try_run_ip_json()
    if ip_json:
        print(ip_json)
        return

    # 2) Read piped stdin if present
    stdin_text = read_stdin_if_available()
    if stdin_text:
        result = parse_ifconfig(stdin_text)
        print(json.dumps(result, indent=2))
        return

    # 3) Try running ifconfig -a
    ifconfig_text = try_run_ifconfig()
    if ifconfig_text:
        result = parse_ifconfig(ifconfig_text)
        print(json.dumps(result, indent=2))
        return

    # 4) Neither ip nor ifconfig available
    print(json.dumps({
        "error": "neither ip nor ifconfig found",
        "resolution": [
            "Install iproute2 and run: ip -j address",
            "Or install net-tools and run: ifconfig -a | python3 ifconfig_to_json.py",
        ],
    }, indent=2))


if __name__ == "__main__":
    main()