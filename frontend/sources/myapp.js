import "./styles/app.css";
import {JetApp, EmptyRouter, HashRouter } from "webix-jet";

// dynamic import of views
const modules = import.meta.glob("./views/**/*.js");
const views = name => modules[`./views/${name}.js`]().then(x => x.default);

export default class MyApp extends JetApp{
	constructor(config){
		const defaults = {
			id 		: import.meta.env.VITE_APPNAME,
			version : import.meta.env.VITE_VERSION,
			router 	: import.meta.env.VITE_BUILD_AS_MODULE ? EmptyRouter : HashRouter,
			debug 	: !import.meta.env.PROD,
			start 	: "/settings?section=account",
			// set custom view loader, mandatory
			views
		};

		super({ ...defaults, ...config });
	}
}

if (!import.meta.env.VITE_BUILD_AS_MODULE){
	webix.ready(() => new MyApp().render() );
}
