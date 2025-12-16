import {JetView} from "webix-jet";
import AccountSettingsView from "./settings/account";
import NotificationSettingsView from "./settings/notifications";
import ThemeSettingsView from "./settings/theme";
import PrivacySettingsView from "./settings/privacy";
import authService from "../services/authService";

const SIDEBAR_STATE_KEY = "settings:sidebarCollapsed";

export const sectionHeader = (title, caption = "") => ({
	view:"template",
	borderless:true,
	autoheight:true,
	css:"settings-section-header",
	template:() => `
		<div class="settings-section-header__title">${webix.template.escape(title)}</div>
		${caption ? `<div class="settings-section-header__caption">${webix.template.escape(caption)}</div>` : ""}
	`
});

const CATEGORIES = [
	{ id:"account", label:"Account", icon:"wxi-user", view:AccountSettingsView },
	{ id:"notifications", label:"Notifications", icon:"wxi-alert", view:NotificationSettingsView },
	{ id:"theme", label:"Theme", icon:"wxi-pencil", view:ThemeSettingsView },
	{ id:"privacy", label:"Privacy", icon:"wxi-eye-slash", view:PrivacySettingsView }
];

export default class SettingsView extends JetView{
	constructor(app, config){
		super(app, config);
		this._mode = "desktop";
		this._fullNavWidth = 150;
		this._iconOnly = this._loadSidebarState();
	}

	_loadSidebarState(){
		const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
		return saved === "true";
	}

	_saveSidebarState(collapsed){
		localStorage.setItem(SIDEBAR_STATE_KEY, collapsed.toString());
	}

	_restoreSavedState(){
		if (this._mode === "desktop" && this._iconOnly){
			const navWrap = this.$$("settings:navwrap");
			const nav = this.$$("settings:nav");
			if (navWrap && nav){
				navWrap.define("width", navWrap.config.minWidth || 110);
				navWrap.resize();
				this._setIconOnly(nav, true);
				this._updateToggleState();
			}
		}
	}

	config(){
		const logo = {
			view:"template",
			id:"settings:logo",
			css:"settings-logo",
			borderless:true,
			autoheight:true,
			template:"<div class='settings-logo__mark'></div>"
		};

		const toggleButton = {
			view:"icon",
			id:"settings:toggle",
			icon:"wxi-menu-left",
			css:"settings-nav-toggle__btn",
			tooltip:"Toggle sidebar labels",
			onClick:{
				"settings-nav-toggle__btn":() => this._toggleIconOnly()
			},
			on:{
				onItemClick:() => this._toggleIconOnly()
			}
		};

		const toggleBar = {
			view:"toolbar",
			css:"settings-nav-toggle",
			padding:{ left:8, right:8 },
			elements:[
				logo,
				{},
				toggleButton
			]
		};

		const navigation = {
			view:"sidebar",
			id:"settings:nav",
			css:"settings-nav",
			select:true,
			scroll:false,
			gravity:1,
			minHeight:0,
			ariaLabel:"Preference categories",
			data: CATEGORIES.map(item => ({
				id:item.id,
				value:item.label,
				icon:item.icon
			})),
			template:"<span class='webix_icon #icon#'></span><span class='settings-nav__text'>#value#</span>"
		};

		const logoutButton = {
			view:"button",
			id:"settings:logout",
			css:"settings-logout-btn webix_danger",
			value:"Logout",
			type:"icon",
			icon:"wxi-angle-double-left",
			height:44,
			tooltip:"Logout from your account",
			click: () => {
				webix.confirm({
					title: "Confirm Logout",
					text: "Are you sure you want to logout?",
					ok: "Logout",
					cancel: "Cancel"
				}).then(async () => {
					await authService.logout();
					window.location.href = "#!/login";
				});
			}
		};

		const tabs = {
			view:"tabbar",
			id:"settings:tabs",
			css:"settings-tabbar",
			ariaLabel:"Preference categories",
			optionWidth:160,
			scroll:true,
			hidden:true,
			tabTemplate:"<span class='webix_icon #icon#'></span><span class='settings-tab__text'>#value#</span>",
			options: CATEGORIES.map(item => ({ id:item.id, value:item.label, icon:item.icon }))
		};

		const navWrap = {
			id:"settings:navwrap",
			css:"settings-nav-wrap",
			width:this._fullNavWidth,
			minWidth:72,
			gravity:0,
			rows:[
				toggleBar,
				{
					rows:[ navigation ],
					gravity:1
				},
				{
					css:"settings-logout-area",
					padding:{ left:8, right:8, top:10, bottom:16 },
					rows:[
						logoutButton
					]
				}
			]
		};

		const panels = {
			view:"multiview",
			id:"settings:views",
			animate:false,
			gravity:1,
			minWidth:0,
			cells: CATEGORIES.map(item => this._buildPanel(item))
		};

		return {
			css:"settings-shell",
			padding:0,
			rows:[
				tabs,
				{
					css:"settings-main",
					cols:[
						navWrap,
						{
							rows:[ panels ],
							css:"settings-panel-wrap",
							gravity:1,
							minWidth:0
						}
					]
				}
			]
		};
	}

	init(){
		const defaultId = CATEGORIES[0].id;
		const currentSection = this._normalizeSection(this._getSectionFromUrl()) || defaultId;

		this._syncSelection(currentSection);
		if (!this._normalizeSection(this._getSectionFromUrl())){
			this._updateUrl(currentSection);
		}
		this._applyResponsive();
		// Don't call _applyNavClamp() here, let _applyResponsive handle the initial state
		this._restoreSavedState();

		this.on(this.$$("settings:nav"), "onAfterSelect", id => this._updateUrl(id));
		this.on(this.$$("settings:tabs"), "onChange", id => this._updateUrl(id));
		this.on(this.$$("settings:navwrap"), "onResize", () => this._applyNavClamp());
		this.on(this.$$("settings:navwrap"), "onViewResize", () => this._applyNavClamp());
		this.on(this.getRoot(), "onResize", () => {
			this._applyResponsive();
			this._applyNavClamp();
		});
		this.on(this.getRoot(), "onViewResize", () => {
			this._applyResponsive();
			this._applyNavClamp();
		});
	}

	urlChange(){
		const section = this._normalizeSection(this._getSectionFromUrl()) || CATEGORIES[0].id;
		if (section !== this._getSectionFromUrl()){
			this.setParam("section", section, true);
		}
		this._syncSelection(section);
	}

	_buildPanel(item){
		const content = item.view ? { $subview:item.view } : { template:"Settings form will appear here." };

		return {
			id:`${item.id}-panel`,
			css:"settings-panel",
			rows:[
				{
					template:`${item.label} Settings`,
					type:"header",
					css:"settings-panel__header",
					autoheight:true
				},
				{
					view: "scrollview",
					scroll: "y",
					body: {
						padding: 20,
						rows: [
							{
								cols: [
									{ gravity: 0.1 },
									{
										gravity: 0.8,
										rows: [
											content
										]
									},
									{ gravity: 0.1 }
								]
							}
						]
					}
				}
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

	_updateUrl(section){
		const validSection = this._normalizeSection(section);
		if (!validSection){
			return;
		}
		const current = this._getSectionFromUrl();

		// Notify subviews before we change section so they can persist unsaved work
		if (current && current !== validSection){
			this.app.callEvent("settings:beforeSectionChange", [current, validSection]);
			
			// Update URL first, then refresh the page to ensure fresh data
			this.setParam("section", validSection, true);
			
			// Small delay to ensure URL is updated before reload
			setTimeout(() => {
				window.location.reload();
			}, 50);
			return;
		}

		if (current === validSection){
			this._syncSelection(validSection);
			return;
		}
		this.setParam("section", validSection, true);
	}

	_getSectionFromUrl(){
		return this.getParam("section", true);
	}

	_normalizeSection(section){
		return CATEGORIES.find(item => item.id === section)?.id;
	}

	_applyResponsive(){
		const root = this.getRoot();
		if (!root){
			return;
		}

		const width = root.$width || root.$view.offsetWidth || 0;
		const mode = width <= 640 ? "mobile" : width <= 1024 ? "tablet" : "desktop";
		this._mode = mode;

		const nav = this.$$("settings:nav");
		const navWrap = this.$$("settings:navwrap");
		const tabs = this.$$("settings:tabs");

		if (mode === "mobile"){
			nav.hide();
			navWrap.hide();
			tabs.show();
			this._setIconOnly(nav, false);
		}
		else {
			tabs.hide();
			nav.show();
			navWrap.show();

			if (mode === "tablet"){
				nav.collapse();
			}
			else {
				// Don't call nav.expand() as it would override the saved collapsed state
				// The saved state will be applied in init() instead
				if (!this._iconOnly){
					nav.expand();
				}
				this._applyNavClamp();
			}
		}
	}

	_applyNavClamp(){
		const root = this.getRoot();
		const nav = this.$$("settings:nav");
		const navWrap = this.$$("settings:navwrap");
		if (!root || !nav || !navWrap){
			return;
		}

		if (this._mode !== "desktop" || !nav.isVisible() || !navWrap.isVisible()){
			this._setIconOnly(nav, false);
			return;
		}

		const totalWidth = root.$width || root.$view.offsetWidth || 0;
		if (!totalWidth){
			return;
		}

		const maxWidth = 260;
		const minWidth = navWrap.config.minWidth || 110;
		const iconThreshold = Math.max(minWidth, Math.round(totalWidth * 0.08));
		let currentWidth = navWrap.$view?.offsetWidth || navWrap.$width || navWrap.config.width || this._fullNavWidth;

		if (currentWidth > maxWidth){
			navWrap.define("width", maxWidth);
			navWrap.resize();
			currentWidth = maxWidth;
		}

		// Only auto-collapse if the saved state doesn't exist or if window is too narrow
		const autoIconOnly = currentWidth <= iconThreshold;
		
		// Check if we have a saved preference
		const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
		const hasSavedState = savedState !== null;
		
		// Use saved state if available, otherwise use auto-calculated state
		const iconOnly = hasSavedState ? this._iconOnly : autoIconOnly;
		
		if (iconOnly){
			navWrap.define("width", Math.max(minWidth, currentWidth));
			navWrap.resize();
		}
		else {
			navWrap.define("width", Math.min(this._fullNavWidth, maxWidth));
			navWrap.resize();
		}

		this._iconOnly = iconOnly;
		this._setIconOnly(nav, iconOnly);
		this._updateToggleState();
	}

	_setIconOnly(nav, enabled){
		const node = nav?.$view;
		const wrap = this.$$("settings:navwrap")?.$view;
		const logoutBtn = this.$$("settings:logout");
		
		if (!node || !node.classList){
			return;
		}
		if (enabled){
			node.classList.add("icon-only");
			if (wrap){
				wrap.classList.add("icon-only");
			}
			if (logoutBtn){
				logoutBtn.define("value", "");
				logoutBtn.define("label", "");
			}
		}
		else {
			node.classList.remove("icon-only");
			if (wrap){
				wrap.classList.remove("icon-only");
			}
			if (logoutBtn){
				logoutBtn.define("value", "Logout");
				logoutBtn.define("label", "Logout");
			}
		}
		if (logoutBtn){
			logoutBtn.refresh();
		}
	}

	_toggleIconOnly(force){
		const nav = this.$$("settings:nav");
		const navWrap = this.$$("settings:navwrap");
		if (!nav || !navWrap){
			return;
		}
		const target = typeof force === "boolean" ? force : !this._iconOnly;
		this._iconOnly = target;

		if (target){
			navWrap.define("width", navWrap.config.minWidth || 110);
		}
		else {
			navWrap.define("width", this._fullNavWidth);
		}
		navWrap.resize();
		this._setIconOnly(nav, target);
		this._updateToggleState();
		this._saveSidebarState(target);
	}

	_updateToggleState(){
		const btn = this.$$("settings:toggle");
		if (!btn){
			return;
		}
		if (this._iconOnly){
			btn.define("icon", "wxi-menu-right");
		}
		else {
			btn.define("icon", "wxi-menu-left");
		}
		btn.refresh();
	}
}
