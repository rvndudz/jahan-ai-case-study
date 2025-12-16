import {JetView} from "webix-jet";
import { getThemePreference, setThemePreference, getAccentPreference, setAccentPreference, getFontFamily, setFontFamily, getFontSize, setFontSize } from "../../services/themeService";
import { sectionHeader } from "../settings";
import authService from "../../services/authService";

export default class ThemeSettingsView extends JetView{
	config(){
		return {
			view:"form",
			borderless:true,
			css:"settings-form",
			elementsConfig:{
				labelWidth:260
			},
			elements:[
				sectionHeader("Appearance", "Choose mode, and accent."),
				{
					margin:8,
					rows:[
						{
							view:"radio",
							name:"themeMode",
							label:"Theme mode",
							labelPosition:"left",
							value:getThemePreference(),
							options:[
								{ id:"system", value:"System" },
								{ id:"light", value:"Light" },
								{ id:"dark", value:"Dark" }
							],
							vertical:false,
							localId:"theme:mode",
							on:{
								onChange: async (value) => {
									const active = setThemePreference(value);
									webix.message(`Theme set to ${active}`);
									try {
										const result = await authService.updateProfile({ themeMode: value });
										if (result.success) {
											// Refresh cache with latest server data
											await authService.getProfile();
										} else {
											webix.message({ type: "error", text: "Failed to save theme preference" });
										}
									} catch (err) {
										console.error("Failed to save theme:", err);
									}
								}
							}
						},
						{
							view:"segmented",
							name:"accentColor",
							label:"Accent color",
							labelPosition:"left",
							value:getAccentPreference(),
							options:[
								{ id:"blue", value:"Blue", css:"accent-chip accent-blue" },
								{ id:"emerald", value:"Emerald", css:"accent-chip accent-emerald" },
								{ id:"amber", value:"Amber", css:"accent-chip accent-amber" },
								{ id:"indigo", value:"Indigo", css:"accent-chip accent-indigo" }
							],
							on:{
								onChange: async (value) => {
									const active = setAccentPreference(value);
									webix.message(`Accent set to ${active}`);
									try {
										const result = await authService.updateProfile({ accentColor: value });
										if (result.success) {
											// Refresh cache with latest server data
											await authService.getProfile();
										} else {
											webix.message({ type: "error", text: "Failed to save accent color" });
										}
									} catch (err) {
										console.error("Failed to save accent:", err);
									}
								}
							}
						}
					]
				},
				{
					margin:8,
					rows:[
						{
							view:"combo",
							name:"fontFamily",
							label:"Font family",
							labelPosition:"left",
							value:getFontFamily(),
							options:[
								{ id:"inter", value:"Inter" },
								{ id:"manrope", value:"Manrope" },
								{ id:"roboto", value:"Roboto" },
								{ id:"workSans", value:"Work Sans" }
							],
							on:{
								onChange: async (value) => {
									setFontFamily(value);
									webix.message(`Font family changed`);
									try {
										const result = await authService.updateProfile({ fontFamily: value });
									if (result.success) {
										// Refresh cache with latest server data
										await authService.getProfile();
									} else {
											webix.message({ type: "error", text: "Failed to save font family" });
										}
									} catch (err) {
										console.error("Failed to save font family:", err);
									}
								}
							}
						},
						{
							view:"radio",
							name:"fontSize",
							label:"Base font size",
							labelPosition:"left",
							value:getFontSize(),
							options:[
								{ id:"small", value:"Small" },
								{ id:"medium", value:"Medium" },
								{ id:"large", value:"Large" }
							],
							vertical:false,
							on:{
								onChange: async (value) => {
									setFontSize(value);
									webix.message(`Font size set to ${value}`);
									try {
										const result = await authService.updateProfile({ fontSize: value });
										if (result.success) {
											// Refresh cache with latest server data
											await authService.getProfile();
										} else {
											webix.message({ type: "error", text: "Failed to save font size" });
										}
									} catch (err) {
										console.error("Failed to save font size:", err);
									}
								}
							}
						}
					]
				},

				sectionHeader("Layout", "Spacing and interactive hints."),
				{
					margin:8,
					rows:[
						{ view:"checkbox", name:"compactMode", label:"Use compact spacing", value:0 },
						{ view:"checkbox", name:"showTooltips", label:"Show tooltips for actions", value:1 },
						{ view:"checkbox", name:"animations", label:"Animate transitions", value:1 }
					]
				}
			]
		};
	}

	async init(view){
		// Flag to prevent saving during initialization
		let isInitializing = true;
		
		// Show loading state while fetching fresh data
		webix.extend(view, webix.ProgressBar);
		view.showProgress();
		
		try {
			// Always fetch fresh data from server to ensure consistency
			const result = await authService.getProfile();
			
			if (result.success && result.user) {
				const user = result.user;
				
				// Sync local storage and DOM with backend
				if(user.themeMode && user.themeMode !== getThemePreference()){
					setThemePreference(user.themeMode);
				}
				if(user.accentColor && user.accentColor !== getAccentPreference()){
					setAccentPreference(user.accentColor);
				}
				
				view.setValues(user);
			} else {
				webix.message({ type: "error", text: result.error || "Failed to load settings" });
			}
		} catch (err) {
			console.error("Failed to load theme settings:", err);
			webix.message({ type: "error", text: "Failed to load settings" });
		} finally {
			view.hideProgress();
			// Initialization complete
			isInitializing = false;
		}
		
		// Save layout preferences when changed
		const layoutCheckboxes = ["compactMode", "showTooltips", "animations"];
		layoutCheckboxes.forEach(fieldName => {
			const field = view.elements[fieldName];
			if (field) {
				field.attachEvent("onChange", async (newValue) => {
					// Skip auto-save during form initialization
					if (isInitializing) return;
					
					const values = view.getValues();
					try {
						const result = await authService.updateProfile(values);
						if (result.success) {
							// Refresh cache with latest server data after successful save
							await authService.getProfile();
						} else {
							webix.message({ type: "error", text: result.error || "Failed to save settings" });
						}
					} catch (err) {
						console.error("Failed to save layout settings:", err);
						webix.message({ type: "error", text: "Failed to save settings" });
					}
				});
			}
		});
	}
}
