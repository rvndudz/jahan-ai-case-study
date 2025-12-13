import {JetView} from "webix-jet";

const CATEGORIES = [
	{ id:"account", label:"Account", icon:"wxi-user" },
	{ id:"notifications", label:"Notifications", icon:"wxi-bell" },
	{ id:"theme", label:"Theme", icon:"wxi-pencil" },
	{ id:"privacy", label:"Privacy", icon:"wxi-lock" }
];

export default class SettingsView extends JetView{
	config(){
		const navigation = {
			view:"sidebar",
			id:"settings:nav",
			css:"settings-nav",
			width:260,
			minWidth:200,
			collapsedWidth:72,
			select:true,
			scroll:"auto",
			ariaLabel:"Preference categories",
			data: CATEGORIES.map(item => ({
				id:item.id,
				value:item.label,
				icon:item.icon
			}))
		};

		const tabs = {
			view:"tabbar",
			id:"settings:tabs",
			css:"settings-tabbar",
			ariaLabel:"Preference categories",
			optionWidth:160,
			scroll:true,
			hidden:true,
			options: CATEGORIES.map(item => ({ id:item.id, value:item.label }))
		};

		const panels = {
			view:"multiview",
			id:"settings:views",
			animate:false,
			gravity:2,
			cells: CATEGORIES.map(item => this._buildPanel(item))
		};

		return {
			css:"settings-shell",
			padding:12,
			rows:[
				tabs,
				{
					css:"settings-main",
					padding:8,
					cols:[
						navigation,
						{ view:"resizer", id:"settings:resizer", css:"settings-resizer" },
						panels
					]
				}
			]
		};
	}

	init(){
		const defaultId = CATEGORIES[0].id;

		this._syncSelection(defaultId);
		this._applyResponsive();

		this.on(this.$$("settings:nav"), "onAfterSelect", id => this._syncSelection(id));
		this.on(this.$$("settings:tabs"), "onChange", id => this._syncSelection(id));
		this.on(this.getRoot(), "onViewResize", () => this._applyResponsive());
	}

	_buildPanel(item){
		return {
			id:`${item.id}-panel`,
			css:"settings-panel",
			rows:[
				{ template:`${item.label} Settings`, type:"header", css:"settings-panel__header" },
				{ template:"Settings form will appear here.", css:"settings-panel__body" }
			]
		};
	}

	_syncSelection(id){
		const nav = this.$$("settings:nav");
		const tabs = this.$$("settings:tabs");

		if (nav.getSelectedId() !== id){
			nav.select(id);
		}
		if (tabs.getValue() !== id){
			tabs.setValue(id);
		}

		const panel = this.$$(`${id}-panel`);
		if (panel){
			panel.show();
		}
	}

	_applyResponsive(){
		const root = this.getRoot();
		if (!root){
			return;
		}

		const width = root.$width || root.$view.offsetWidth || 0;
		const mode = width <= 640 ? "mobile" : width <= 1024 ? "tablet" : "desktop";

		const nav = this.$$("settings:nav");
		const tabs = this.$$("settings:tabs");
		const resizer = this.$$("settings:resizer");

		if (mode === "mobile"){
			nav.hide();
			resizer.hide();
			tabs.show();
		}
		else {
			tabs.hide();
			nav.show();
			resizer.show();

			if (mode === "tablet"){
				nav.collapse();
			}
			else {
				nav.expand();
			}
		}
	}
}
