import {JetView} from "webix-jet";

export default class AccountSettingsView extends JetView{
	config(){
		return {
			view: "form",
			elements: [
				// Basic Information Section
				{ template: "Basic Information", type: "section" },
				{ view: "text", label: "First Name", name: "firstName" },
				{ view: "text", label: "Surname", name: "surname" },
				{ view: "text", label: "Username", name: "username" },
				{ 
					view: "combo", 
					label: "Country", 
					name: "country",
					options: []
				},
				
				// Contact Information Section
				{ template: "Contact Information", type: "section" },
				{ view: "text", label: "Email", name: "email", inputType: "email" },
				{ 
					view: "layout",
					cols: [
						{ 
							view: "text", 
							label: "Country Code", 
							name: "countryCode",
							width: 150,
							placeholder: "+1"
						},
						{ 
							view: "text", 
							label: "Phone Number", 
							name: "phoneNumber",
							inputType: "tel"
						}
					]
				},
				
				// Personal Details Section
				{ template: "Personal Details", type: "section" },
				{ 
					view: "datepicker", 
					label: "Date of Birth", 
					name: "dateOfBirth",
					stringResult: true
				},
				{ 
					view: "radio", 
					label: "Gender", 
					name: "gender",
					options: [
						{ id: "male", value: "Male" },
						{ id: "female", value: "Female" },
						{ id: "other", value: "Other" },
						{ id: "prefer-not-to-say", value: "Prefer not to say" }
					]
				},
				
				// Save Button
				{ 
					view: "button", 
					value: "Save Changes", 
					css: "webix_primary",
					click: function() {
						const form = this.getFormView();
						if (form.validate()) {
							const values = form.getValues();
							webix.message("Account settings saved");
							console.log("Form values:", values);
						}
					}
				}
			],
			rules: {
				firstName: webix.rules.isNotEmpty,
				surname: webix.rules.isNotEmpty,
				username: webix.rules.isNotEmpty,
				email: webix.rules.isEmail
			}
		};
	}
}
