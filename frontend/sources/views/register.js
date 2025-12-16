import { JetView } from "webix-jet";
import authService from "../services/authService";

export default class RegisterView extends JetView {
    config() {
        return {
            css: "register-page",
            rows: [
                {},
                {
                    cols: [
                        {},
                        {
                            view: "form",
                            id: "registerForm",
                            width: 450,
                            elements: [
                                {
                                    view: "template",
                                    template: "<h2 style='text-align:center; margin:10px 0 20px 0; color:#333;'>Create Account</h2>",
                                    borderless: true,
                                    height: 60
                                },
                                {
                                    view: "text",
                                    name: "email",
                                    label: "Email",
                                    labelPosition: "top",
                                    placeholder: "your@email.com",
                                    height: 70
                                },
                                {
                                    view: "text",
                                    type: "password",
                                    name: "password",
                                    label: "Password",
                                    labelPosition: "top",
                                    placeholder: "Create a strong password",
                                    height: 70
                                },
                                {
                                    view: "text",
                                    type: "password",
                                    name: "password2",
                                    label: "Confirm Password",
                                    labelPosition: "top",
                                    placeholder: "Re-enter your password",
                                    height: 70
                                },
                                { height: 15 },
                                {
                                    view: "button",
                                    value: "Create Account",
                                    css: "webix_primary",
                                    height: 45,
                                    click: () => this.doRegister()
                                },
                                { height: 10 },
                                {
                                    view: "button",
                                    value: "Already have an account? Login",
                                    height: 40,
                                    click: () => this.show("login")
                                },
                                {
                                    view: "template",
                                    id: "registerError",
                                    template: "",
                                    borderless: true,
                                    autoheight: true,
                                    css: "error-message"
                                }
                            ],
                            rules: {
                                email: webix.rules.isEmail,
                                password: webix.rules.isNotEmpty,
                                password2: webix.rules.isNotEmpty
                            }
                        },
                        {}
                    ]
                },
                {}
            ]
        };
    }

    async doRegister() {
        const form = $$("registerForm");
        
        if (!form.validate()) {
            webix.message({ type: "error", text: "Please fill in all required fields" });
            return;
        }
        
        const values = form.getValues();
        
        // Check if passwords match
        if (values.password !== values.password2) {
            $$("registerError").setHTML(`
                <div style="color: #d9534f; text-align: center; padding: 10px;">
                    <strong>Password Error:</strong> The passwords you entered do not match. Please make sure both password fields are identical.
                </div>
            `);
            webix.message({ type: "error", text: "Passwords do not match" });
            return;
        }
        
        // Show loading
        webix.message({ type: "info", text: "Creating account..." });
        
        const result = await authService.register(values);
        
        if (result.success) {
            webix.message({ type: "success", text: "Account created successfully!" });
            
            // Navigate to settings
            this.show("/settings?section=account");
        } else {
            // Check for email-specific errors
            let errorMessage = "";
            let shouldClearEmail = false;
            
            if (result.details) {
                // Check if email field has an error
                if (result.details.email) {
                    const emailError = Array.isArray(result.details.email) 
                        ? result.details.email[0] 
                        : result.details.email;
                    
                    errorMessage = `<strong>Email Error:</strong> ${emailError}`;
                    shouldClearEmail = true;
                    
                    // Clear the email field
                    form.setValues({ email: "" }, true);
                } 
                // Check for password errors
                else if (result.details.password) {
                    const passwordError = Array.isArray(result.details.password) 
                        ? result.details.password[0] 
                        : result.details.password;
                    
                    errorMessage = `<strong>Password Error:</strong> ${passwordError}`;
                }
                // Check for other field errors
                else {
                    const errorFields = Object.entries(result.details)
                        .map(([field, value]) => {
                            const errorText = Array.isArray(value) ? value.join(', ') : value;
                            return `<strong>${field.charAt(0).toUpperCase() + field.slice(1)} Error:</strong> ${errorText}`;
                        })
                        .join('<br>');
                    errorMessage = errorFields;
                }
            } else {
                errorMessage = result.error || "Registration failed. Please try again.";
            }
            
            $$("registerError").setHTML(`
                <div style="color: #d9534f; text-align: center; padding: 10px; background-color: #f8d7da; border-radius: 4px; margin-top: 10px;">
                    ${errorMessage}
                </div>
            `);
            
            // Show a user-friendly message
            if (shouldClearEmail) {
                webix.message({ 
                    type: "error", 
                    text: "An account with this email already exists. Please use a different email address.",
                    expire: 5000
                });
            } else {
                webix.message({ type: "error", text: result.error });
            }
        }
    }
}
