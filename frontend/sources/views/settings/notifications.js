import {JetView} from "webix-jet";
import { sectionHeader } from "../settings";

export default class NotificationSettingsView extends JetView{
	config(){
		return {
			view:"form",
			borderless:true,
			elementsConfig:{
				labelWidth:260
			},
			elements:[
				sectionHeader("Delivery Channels", "Choose where updates reach you."),
				{
					margin:8,
					rows:[
						{ view:"switch", label:"Email alerts", onLabel:"On", offLabel:"Off", value:1 },
						{ view:"switch", label:"Push notifications", onLabel:"On", offLabel:"Off", value:1 },
						{ view:"switch", label:"SMS alerts", onLabel:"On", offLabel:"Off", value:0 },
						{
							view:"combo",
							name:"digestFrequency",
							label:"Digest frequency",
							labelPosition:"left",
							value:"daily",
							options:[
								{ id:"instant", value:"Instant" },
								{ id:"hourly", value:"Hourly" },
								{ id:"daily", value:"Daily" },
								{ id:"weekly", value:"Weekly" }
							]
						}
					]
				},

				sectionHeader("Activity Alerts", "Pick events you care about."),
				{
					margin:12,
					rows:[
						{ view:"checkbox", name:"securityAlerts", label:"Logins from new devices", value:1 },
						{ view:"checkbox", name:"mentions", label:"Mentions and replies", value:1 },
						{ view:"checkbox", name:"weeklySummary", label:"Weekly summary", value:1 },
						{ view:"checkbox", name:"productUpdates", label:"Product updates and offers", value:0 }
					]
				},

				sectionHeader("Quiet Hours", "Silence notifications on a schedule."),
				{
					margin:8,
					rows:[
						{ view:"switch", label:"Enable do not disturb", onLabel:"On", offLabel:"Off", value:0 },
						{
							cols:[
								{ view:"combo", name:"dndStart", label:"Start", labelPosition:"top", value:"21:00", options:["18:00","19:00","20:00","21:00","22:00","23:00"] },
								{ view:"combo", name:"dndEnd", label:"End", labelPosition:"top", value:"07:00", options:["05:00","06:00","07:00","08:00","09:00"] }
							]
						}
					]
				}
			]
		};
	}
}
