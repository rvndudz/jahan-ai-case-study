import {JetView} from "webix-jet";
import { sectionHeader } from "../settings";
import authService from "../../services/authService";

export default class AccountSettingsView extends JetView{
	constructor(app, config){
		super(app, config);
		this._editing = false;
		this._passwordWin = null;
	}


	config(){
		return {
			view: "form",
			borderless:true,
			id: "account:form",
			css: "settings-account-form",
			elementsConfig:{
				labelWidth: 260
			},
			elements: [
				// Basic Information Section
				sectionHeader("Basic Information", "Your core profile details."),
				{ view: "text", label: "First Name", name: "firstName" },
				{ view: "text", label: "Surname", name: "surname" },

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
				sectionHeader("Contact Information", "How we stay in touch."),
				{ view: "text", label: "Email", name: "email", inputType: "email", invalidMessage: "Please enter a valid email address" },
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
				sectionHeader("Personal Details", "Optional demographic details."),
				{ 
					view: "datepicker", 
					label: "Date of Birth", 
					name: "dateOfBirth",
					stringResult: true,
					format: "%Y-%m-%d",
					invalidMessage: "Date of birth must be in the past"
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
				email: (value) => {
					if (!value) return false;
					// Proper email validation with @ and domain
					const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
					return emailRegex.test(value);
				},
				dateOfBirth: (value) => {
					if (!value) return true; // Allow empty (optional field)
					// Check if date is in the past
					const selectedDate = new Date(value);
					const today = new Date();
					today.setHours(0, 0, 0, 0); // Reset time to start of day
					return selectedDate < today;
				}
			}
		};
	}

	init(){
		this._setEditing(false);
		this._loadProfile();
	}

	async _loadProfile() {
		const form = this.$$("account:form");
		if (!form) return;

		// Show loading state
		webix.extend(form, webix.ProgressBar);
		form.showProgress();

		try {
			const result = await authService.getProfile();
			
			if (result.success && result.user) {
				const user = result.user;
				
				form.setValues({
					firstName: user.firstName || '',
					surname: user.lastName || '',
					country: user.country || '',
					email: user.email,
					countryCode: user.countryCode || '',
					phoneNumber: user.phone || '',
					dateOfBirth: user.dateOfBirth || '',
					gender: user.gender || ''
				});
			} else {
				webix.message({ type: 'error', text: result.error || 'Failed to load profile' });
			}
		} catch (error) {
			console.error('Error loading profile:', error);
			webix.message({ type: 'error', text: 'Failed to load profile' });
		} finally {
			form.hideProgress();
		}
	}

	async _toggleEditing(){
		const nextState = !this._editing;
		
		// If switching from editing to not editing, save the data
		if (this._editing && !nextState) {
			await this._saveProfile();
		}
		
		this._setEditing(nextState);
	}

	async _saveProfile() {
		const form = this.$$("account:form");
		if (!form) return;

		if (!form.validate()) {
			webix.message({ type: 'error', text: 'Please fix validation errors' });
			return;
		}

		const values = form.getValues();

		// Show loading state
		webix.extend(form, webix.ProgressBar);
		form.showProgress();

		try {
			const result = await authService.updateProfile({
				firstName: values.firstName || '',
				lastName: values.surname || '',
				email: values.email,
				country: values.country,
				countryCode: values.countryCode,
				phone: values.phoneNumber,
				dateOfBirth: values.dateOfBirth,
				gender: values.gender
			});

			if (result.success) {
				webix.message({ type: 'success', text: result.message || 'Profile updated successfully' });
			} else {
				webix.message({ type: 'error', text: result.error || 'Failed to update profile' });
				if (result.details) {
					console.error('Validation errors:', result.details);
				}
			}
		} catch (error) {
			console.error('Error saving profile:', error);
			webix.message({ type: 'error', text: 'Failed to save profile' });
		} finally {
			form.hideProgress();
		}
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
				
				// Radio buttons, checkboxes, and some other controls don't support readonly properly
				// They need to be disabled/enabled instead
				if (viewName === "radio" || viewName === "checkbox" || viewName === "switch"){
					if (view.disable && view.enable){
						enabled ? view.enable() : view.disable();
					}
				}
				else if (view.define){
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

	async _submitPassword(){
		const pwdForm = this.$$("account:pwdform");
		if (!pwdForm){
			return;
		}
		if (!pwdForm.validate()){
			return;
		}
		
		const values = pwdForm.getValues();
		
		// Show loading state
		webix.extend(pwdForm, webix.ProgressBar);
		pwdForm.showProgress();

		try {
			const result = await authService.changePassword(
				values.currentPassword,
				values.newPassword,
				values.confirmPassword
			);

			if (result.success) {
				webix.message({ type: 'success', text: result.message || 'Password changed successfully' });
				this._passwordWin.hide();
				pwdForm.clear();
			} else {
				webix.message({ type: 'error', text: result.error || 'Failed to change password' });
				if (result.details) {
					console.error('Password change errors:', result.details);
				}
			}
		} catch (error) {
			console.error('Error changing password:', error);
			webix.message({ type: 'error', text: 'Failed to change password' });
		} finally {
			pwdForm.hideProgress();
		}
	}
}
