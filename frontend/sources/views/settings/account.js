import {JetView} from "webix-jet";

export default class AccountSettingsView extends JetView{
	constructor(app, config){
		super(app, config);
		this._editing = false;
		this._passwordWin = null;
	}

	config(){
		return {
			view: "form",
			id: "account:form",
			css: "settings-account-form",
			elementsConfig:{
				labelWidth: 260
			},
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
					options: [
						{ id: "us", value: "United States" },
						{ id: "ca", value: "Canada" },
						{ id: "uk", value: "United Kingdom" },
						{ id: "au", value: "Australia" },
						{ id: "in", value: "India" },
						{ id: "sg", value: "Singapore" },
						{ id: "lk", value: "Sri Lanka" }
					]
				},
				
				// Contact Information Section
				{ template: "Contact Information", type: "section" },
				{ view: "text", label: "Email", name: "email", inputType: "email" },
				{ 
					view: "layout",
					type: "clean",
					cols: [
						{ 
							view: "combo", 
							label: "Country Code", 
							name: "countryCode",
							width: 220,
							placeholder: "+1",
							labelWidth: 110,
							options: [
								{ id:"+1", value:"+1 (US/CA)" },
								{ id:"+44", value:"+44 (UK)" },
								{ id:"+61", value:"+61 (AU)" },
								{ id:"+65", value:"+65 (SG)" },
								{ id:"+91", value:"+91 (IN)" },
								{ id:"+94", value:"+94 (LK)" }
							]
						},
						{ 
							view: "text", 
							label: "Phone Number", 
							name: "phoneNumber",
							inputType: "tel",
							labelWidth: 110,
							gravity: 1,
							minWidth: 280
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
				
				// Action buttons
				{
					margin: 12,
					cols:[
						{},
						{ view:"button", id:"account:password", value:"Change Password", width:170, click:() => this._showPasswordDialog() },
						{ width: 12 },
						{ view:"button", id:"account:edit", value:"Edit Profile", width:130, css:"webix_secondary", click:() => this._toggleEditing() }
					]
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

	init(){
		this._setEditing(false);
	}

	_toggleEditing(){
		const nextState = !this._editing;
		this._setEditing(nextState);
	}

	_setEditing(enabled){
		this._editing = enabled;
		const form = this.$$("account:form");
		if (form){
			this._walkInputs(form, view => {
				const viewName = view.config?.view;
				if (viewName === "template" || viewName === "button"){
					return;
				}
				if (view.define){
					view.define("readonly", !enabled);
					view.refresh && view.refresh();
				}
				else if (view.disable && view.enable){
					enabled ? view.enable() : view.disable();
				}
			});
		}

		const editBtn = this.$$("account:edit");
		if (editBtn){
			editBtn.define("value", enabled ? "Done Editing" : "Edit Profile");
			editBtn.refresh();
		}
	}

	_walkInputs(root, callback){
		if (!root || !root.getChildViews){
			return;
		}
		root.getChildViews().forEach(view => {
			const name = view.config?.view;
			// Skip templates/sections/buttons/layouts when toggling
			if (name === "template" || name === "button"){
				return;
			}
			if (view.getChildViews && view.getChildViews().length){
				this._walkInputs(view, callback);
				return;
			}
			if (typeof callback === "function"){
				callback(view);
			}
		});
	}

	_showPasswordDialog(){
		if (!this._passwordWin){
			this._passwordWin = this.ui({
				view:"window",
				id:"account:pwdwin",
				width:420,
				position:"center",
				modal:true,
				head:"Change Password",
				body:{
					view:"form",
					id:"account:pwdform",
					padding:20,
					elementsConfig:{ labelWidth:160 },
					elements:[
						{ view:"text", type:"password", name:"currentPassword", label:"Current Password", required:true },
						{ view:"text", type:"password", name:"newPassword", label:"New Password", required:true },
						{ view:"text", type:"password", name:"confirmPassword", label:"Confirm Password", required:true, invalidMessage:"Passwords do not match" },
						{
							margin:10,
							cols:[
								{},
								{ view:"button", value:"Cancel", width:100, click:() => this._passwordWin.hide() },
								{ view:"button", value:"Update", width:120, css:"webix_primary", click:() => this._submitPassword() }
							]
						}
					],
					rules:{
						currentPassword: webix.rules.isNotEmpty,
						newPassword: webix.rules.isNotEmpty,
						confirmPassword: (value, obj) => value === obj.newPassword
					}
				}
			});
		}
		const pwdForm = this.$$("account:pwdform");
		if (pwdForm){
			pwdForm.clear();
			pwdForm.clearValidation();
		}
		this._passwordWin.show();
	}

	_submitPassword(){
		const pwdForm = this.$$("account:pwdform");
		if (!pwdForm){
			return;
		}
		if (!pwdForm.validate()){
			return;
		}
		const values = pwdForm.getValues();
		console.log("Password change submitted", values);
		webix.message("Password updated");
		this._passwordWin.hide();
	}
}
