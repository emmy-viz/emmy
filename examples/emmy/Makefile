run:
	npm start

build:
	ng build --prod --deploy-url "https://emmy-viz.github.io/emmy/" --base-href "https://emmy-viz.github.io/emmy/"
	mv dist/emmy/* ../../docs

deploy: build
	git add -A .
	git commit -m "release"
	git push origin master