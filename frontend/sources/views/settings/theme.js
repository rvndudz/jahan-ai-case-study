import {JetView} from "webix-jet";

export default class ThemeSettingsView extends JetView{
	config(){
		return {
			view:"form",
			borderless:true,
			elements:[
				{ template:"Appearance", type:"header", borderless:true, css:"settings-section-title" },
				{
					margin:8,
					rows:[
						{
							view:"radio",
							name:"themeMode",
							label:"Theme mode",
							labelPosition:"top",
							value:"system",
							options:[
								{ id:"system", value:"System" },
								{ id:"light", value:"Light" },
								{ id:"dark", value:"Dark" }
							],
							vertical:false
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

				{ template:"Typography", type:"header", borderless:true, css:"settings-section-title" },
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

				{ template:"Layout", type:"header", borderless:true, css:"settings-section-title" },
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
