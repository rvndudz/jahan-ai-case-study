import {JetView} from "webix-jet";
import { sectionHeader } from "../settings";
import authService from "../../services/authService";

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
							name:"emailAlerts", 
							label:"Email alerts", 
							onLabel:"On", 
							offLabel:"Off", 
							value:1
						},
						{ 
							view:"switch", 
							name:"pushNotifications", 
							label:"Push notifications", 
							onLabel:"On", 
							offLabel:"Off", 
							value:1
						},
						{ 
							view:"switch", 
							name:"smsAlerts", 
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
							name:"dndEnabled", 
							label:"Enable do not disturb", 
							onLabel:"On", 
							offLabel:"Off", 
							value:0
						},
						{
							cols:[
								{ view:"combo", name:"dndStartTime", label:"Start", labelPosition:"top", value:"21:00", options:["18:00","19:00","20:00","21:00","22:00","23:00"] },
								{ view:"combo", name:"dndEndTime", label:"End", labelPosition:"top", value:"07:00", options:["05:00","06:00","07:00","08:00","09:00"] }
							]
						}
					]
				}
			]
		};
	}

	async init(view){
		// Flag to prevent saving during initialization
		let isInitializing = true;
		
		// Attach onChange handler BEFORE loading data, but check initialization flag
		view.attachEvent("onChange", async (newv, oldv) => {
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
				console.error("Failed to save notification settings:", err);
				webix.message({ type: "error", text: "Failed to save settings" });
			}
		});
		
		// Show loading state while fetching fresh data
		webix.extend(view, webix.ProgressBar);
		view.showProgress();
		
		try {
			// Always fetch fresh data from server to ensure consistency
			const result = await authService.getProfile();
			
			if (result.success && result.user) {
				view.setValues(result.user);
			} else {
				webix.message({ type: "error", text: result.error || "Failed to load settings" });
			}
		} catch (err) {
			console.error("Failed to load notification settings:", err);
			webix.message({ type: "error", text: "Failed to load settings" });
		} finally {
			view.hideProgress();
			// Initialization complete - now user changes will trigger saves
			isInitializing = false;
		}
	}
}
