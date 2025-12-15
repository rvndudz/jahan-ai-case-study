import {JetView} from "webix-jet";
import { sectionHeader } from "../settings";
import authService from "../../services/authService";

export default class PrivacySettingsView extends JetView{
	config(){
		return {
			view:"form",
			borderless:true,
			css:"settings-form",
			elementsConfig:{
				labelWidth:260
			},
			elements:[
				sectionHeader("Profile Visibility", "Control how others can find you."),
				{
					margin:8,
					rows:[
						{ view:"checkbox", name:"profileSearchable", label:"Show my profile in search results", value:0 },
						{ view:"checkbox", name:"messagesFromAnyone", label:"Allow messages from non-contacts", value:0 },
						{ view:"checkbox", name:"showOnlineStatus", label:"Display online status", value:1 }
					]
				},

				sectionHeader("Security", "Keep sign-ins protected."),
				{
					margin:8,
					rows:[
						{ view:"switch", name:"twoFactorEnabled", label:"Two-factor authentication", labelWidth:200, onLabel:"On", offLabel:"Off", value:1 },
						{ view:"switch", name:"loginAlerts", label:"Login alerts", labelWidth:200, onLabel:"On", offLabel:"Off", value:1 },
					]
				},

				sectionHeader("Data Control", "Manage analytics and data actions."),
				{
					margin:8,
					rows:[
						{ view:"checkbox", name:"analyticsEnabled", label:"Allow anonymized analytics", value:1 },
						{ view:"checkbox", name:"personalizedAds", label:"Personalized recommendations", value:0 },
					]
				}
			]
		};
	}

	init(view){
		const user = authService.getCurrentUser();
		if(user){
			view.setValues(user);
		}

		view.attachEvent("onChange", async (newv, oldv) => {
			const values = view.getValues();
			try {
				const result = await authService.updateProfile(values);
				if (!result.success) {
					webix.message({ type: "error", text: result.error || "Failed to save settings" });
				}
			} catch (err) {
				console.error("Failed to save privacy settings:", err);
				webix.message({ type: "error", text: "Failed to save settings" });
			}
		});
	}

	_actionMessage(text){
		webix.message(text);
	}
}
