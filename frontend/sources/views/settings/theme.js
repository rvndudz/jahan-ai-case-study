import {JetView} from "webix-jet";
import { getThemePreference, setThemePreference, getAccentPreference, setAccentPreference } from "../../services/themeService";
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
								{ id:"blue", value:"Blue" },
								{ id:"emerald", value:"Emerald" },
								{ id:"amber", value:"Amber" },
								{ id:"indigo", value:"Indigo" }
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
							value:"inter",
							options:[
								{ id:"inter", value:"Inter" },
								{ id:"manrope", value:"Manrope" },
								{ id:"roboto", value:"Roboto" },
								{ id:"workSans", value:"Work Sans" }
							]
						},
						{
							view:"slider",
							name:"baseFont",
							label:"Base font size",
							labelPosition:"left",
							title:webix.template("#value# px"),
							min:12,
							max:18,
							value:14,
							step:1
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
