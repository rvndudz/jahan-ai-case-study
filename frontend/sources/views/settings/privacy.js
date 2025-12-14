import {JetView} from "webix-jet";

export default class PrivacySettingsView extends JetView{
	config(){
		return {
			view:"form",
			borderless:true,
			elementsConfig:{
				labelWidth:260
			},
			elements:[
				{ template:"Profile Visibility", type:"section", borderless:true},
				{
					margin:8,
					rows:[
						{ view:"checkbox", name:"searchable", label:"Show my profile in search results", value:0 },
						{ view:"checkbox", name:"messagesFromAnyone", label:"Allow messages from non-contacts", value:0 },
						{ view:"checkbox", name:"presence", label:"Display online status", value:1 }
					]
				},

				{ template:"Security", type:"section", borderless:true},
				{
					margin:8,
					rows:[
						{ view:"switch", name:"twoFactor", label:"Two-factor authentication", labelWidth:200, onLabel:"On", offLabel:"Off", value:1 },
						{ view:"switch", name:"loginAlerts", label:"Login alerts", labelWidth:200, onLabel:"On", offLabel:"Off", value:1 },
						{
							cols:[
								{ view:"button", css:"webix_primary", label:"Review active sessions", width:200, click:() => this._actionMessage("Active sessions opened") },
								{ view:"button", label:"Reset all tokens", width:180, click:() => this._actionMessage("Tokens reset") }
							]
						}
					]
				},

				{ template:"Data Control", type:"section", borderless:true},
				{
					margin:8,
					rows:[
						{ view:"checkbox", name:"analytics", label:"Allow anonymized analytics", value:1 },
						{ view:"checkbox", name:"personalizedAds", label:"Personalized recommendations", value:0 },
						{
							cols:[
								{ view:"button", label:"Download my data", width:180, click:() => this._actionMessage("Preparing export") },
								{ view:"button", label:"Delete my account", css:"webix_danger", width:180, click:() => this._actionMessage("Deletion scheduled") }
							]
						}
					]
				}
			]
		};
	}

	_actionMessage(text){
		webix.message(text);
	}
}
