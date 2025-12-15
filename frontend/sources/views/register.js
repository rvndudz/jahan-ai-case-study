import { JetView } from "webix-jet";
import authService from "../services/authService";

export default class RegisterView extends JetView {
    config() {
        return {
            rows: [
                { height: 50 },
                {
                    cols: [
                        {},
                        {
                            view: "form",
                            id: "registerForm",
                            width: 400,
                            scroll: "y",
                            elements: [
                                {
                                    view: "template",
                                    template: "<h2 style='text-align:center; margin:20px 0;'>Create Account</h2>",
                                    borderless: true,
                                    height: 60
                                },
                                {
                                    view: "text",
                                    name: "fullName",
                                    label: "Full Name",
                                    labelPosition: "top",
                                    placeholder: "John Doe"
                                },
                                { height: 10 },
                                {
                                    view: "text",
                                    name: "email",
                                    label: "Email",
                                    labelPosition: "top",
                                    placeholder: "your@email.com"
                                },
                                { height: 10 },
                                {
                                    view: "text",
                                    type: "password",
                                    name: "password",
                                    label: "Password",
                                    labelPosition: "top",
                                    placeholder: "Create a strong password"
                                },
                                { height: 10 },
                                {
                                    view: "text",
                                    type: "password",
                                    name: "password2",
                                    label: "Confirm Password",
                                    labelPosition: "top",
                                    placeholder: "Re-enter your password"
                                },
                                { height: 20 },
                                {
                                    view: "button",
                                    value: "Create Account",
                                    css: "webix_primary",
                                    click: () => this.doRegister()
                                },
                                { height: 10 },
                                {
                                    view: "button",
                                    value: "Already have an account? Login",
                                    click: () => this.show("login")
                                },
                                {
                                    view: "template",
                                    id: "registerError",
                                    template: "",
                                    borderless: true,
                                    height: 40,
                                    css: "error-message"
                                }
                            ],
                            rules: {
                                fullName: webix.rules.isNotEmpty,
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
                    Passwords do not match
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
            let errorMessage = result.error;
            
            // Show detailed errors if available
            if (result.details) {
                const details = Object.entries(result.details)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('<br>');
                errorMessage += '<br>' + details;
            }
            
            $$("registerError").setHTML(`
                <div style="color: #d9534f; text-align: center; padding: 10px;">
                    ${errorMessage}
                </div>
            `);
            webix.message({ type: "error", text: result.error });
        }
    }
}
