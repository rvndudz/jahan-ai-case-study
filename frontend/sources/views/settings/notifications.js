import {JetView} from "webix-jet";
import { sectionHeader } from "../settings";
import { subscribeThemeChange, getAccentPreference } from "../../services/themeService";

const ACCENTS = {
	blue:  "#0ea5e9",
	emerald:"#10b981",
	amber: "#f59e0b",
	indigo:"#6366f1"
};

export default class NotificationSettingsView extends JetView{
	config(){
		return {
			view:"form",
			borderless:true,
			css:"settings-form",
			elementsConfig:{
				labelWidth:260
			},
			elements:[
				sectionHeader("Delivery Channels", "Choose where updates reach you."),
				{
					margin:8,
					rows:[
						{ 
							view:"switch", 
							localId:"emailSwitch", 
							label:"Email alerts", 
							onLabel:"On", 
							offLabel:"Off", 
							value:1
						},
						{ 
							view:"switch", 
							localId:"pushSwitch", 
							label:"Push notifications", 
							onLabel:"On", 
							offLabel:"Off", 
							value:1
						},
						{ 
							view:"switch", 
							localId:"smsSwitch", 
							label:"SMS alerts", 
							onLabel:"On", 
							offLabel:"Off", 
							value:0
						},
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
						{ 
							view:"switch", 
							localId:"dndSwitch", 
							label:"Enable do not disturb", 
							onLabel:"On", 
							offLabel:"Off", 
							value:0
						},
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
	
	ready(){
		// Attach event listeners
		["emailSwitch", "pushSwitch", "smsSwitch", "dndSwitch"].forEach(id => {
			const view = this.$$(id);
			if(view){
				view.attachEvent("onChange", () => {
					this.applyThemeToSwitches();
				});
			}
		});
		
		// Apply theme initially
		this.applyThemeToSwitches();
		
		// Subscribe to theme changes
		this.unsubscribe = subscribeThemeChange(() => {
			this.applyThemeToSwitches();
		});
	}
	
	applyThemeToSwitches(){
		const accent = getAccentPreference();
		const color = ACCENTS[accent] || ACCENTS.blue;
		console.log("Applying theme to switches:", accent, color);
		
		// Apply to all switches in the form
		const form = this.getRoot();
		if(form && form.$view){
			const switches = form.$view.querySelectorAll(".webix_switch_box.webix_switch_on");
			console.log("Found switches:", switches.length);
			switches.forEach(switchBox => {
				switchBox.style.backgroundColor = color + " !important";
				switchBox.style.borderColor = color + " !important";
			});
		}
	}
	
	destroy(){
		if(this.unsubscribe){
			this.unsubscribe();
		}
	}
}
