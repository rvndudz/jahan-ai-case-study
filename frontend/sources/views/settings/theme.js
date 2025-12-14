import {JetView} from "webix-jet";
import { getThemePreference, setThemePreference } from "../../services/themeService";

export default class ThemeSettingsView extends JetView{
	config(){
		return {
			view:"form",
			borderless:true,
			elementsConfig:{
				labelWidth:260
			},
			elements:[
				{ template:"Appearance", type:"section", borderless:true},
				{
					margin:8,
					rows:[
						{
							view:"radio",
							name:"themeMode",
							label:"Theme mode",
							labelPosition:"top",
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
							labelPosition:"top",
							value:"blue",
							options:[
								{ id:"blue", value:"Blue" },
								{ id:"emerald", value:"Emerald" },
								{ id:"amber", value:"Amber" },
								{ id:"indigo", value:"Indigo" }
							]
						},
						{
							view:"slider",
							name:"cornerRadius",
							label:"Card roundness",
							labelPosition:"top",
							title:webix.template("#value# px"),
							min:4,
							max:18,
							value:10,
							step:1
						}
					]
				},

				{ template:"Typography", type:"section", borderless:true},
				{
					margin:8,
					rows:[
						{
							view:"combo",
							name:"fontFamily",
							label:"Font family",
							labelPosition:"top",
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
							labelPosition:"top",
							title:webix.template("#value# px"),
							min:12,
							max:18,
							value:14,
							step:1
						}
					]
				},

				{ template:"Layout", type:"section", borderless:true},
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
