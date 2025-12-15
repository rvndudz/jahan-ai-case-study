import {JetView} from "webix-jet";
import { getThemePreference, setThemePreference, getAccentPreference, setAccentPreference, getFontFamily, setFontFamily, getFontSize, setFontSize } from "../../services/themeService";
import { sectionHeader } from "../settings";

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
								onChange:value => {
									const active = setThemePreference(value);
									webix.message(`Theme set to ${active}`);
								}
							}
						},
						{
							view:"segmented",
							name:"accent",
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
								onChange:value => {
									const active = setAccentPreference(value);
									webix.message(`Accent set to ${active}`);
								}
							}
						}
					]
				},

				sectionHeader("Typography", "Fonts and sizes for the app."),
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
								onChange:value => {
									setFontFamily(value);
									webix.message(`Font family changed`);
								}
							}
						},
						{
							view:"radio",
							name:"baseFont",
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
								onChange:value => {
									setFontSize(value);
									webix.message(`Font size set to ${value}`);
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
}
