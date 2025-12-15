import { JetView } from "webix-jet";
import authService from "../services/authService";

export default class LoginView extends JetView {
    config() {
        return {
            rows: [
                { height: 50 },
                {
                    cols: [
                        {},
                        {
                            view: "form",
                            id: "loginForm",
                            width: 400,
                            elements: [
                                {
                                    view: "template",
                                    template: "<h2 style='text-align:center; margin:20px 0;'>Login</h2>",
                                    borderless: true,
                                    height: 60
                                },
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
                                    placeholder: "Enter your password"
                                },
                                { height: 10 },
                                {
                                    view: "checkbox",
                                    name: "remember",
                                    labelRight: "Remember me",
                                    labelWidth: 0
                                },
                                { height: 20 },
                                {
                                    view: "button",
                                    value: "Login",
                                    css: "webix_primary",
                                    click: () => this.doLogin()
                                },
                                { height: 10 },
                                {
                                    view: "button",
                                    value: "Create Account",
                                    click: () => this.show("register")
                                },
                                {
                                    view: "template",
                                    id: "loginError",
                                    template: "",
                                    borderless: true,
                                    height: 40,
                                    css: "error-message"
                                }
                            ],
                            rules: {
                                email: webix.rules.isEmail,
                                password: webix.rules.isNotEmpty
                            }
                        },
                        {}
                    ]
                },
                {}
            ]
        };
    }

    async doLogin() {
        const form = $$("loginForm");
        
        if (!form.validate()) {
            webix.message({ type: "error", text: "Please fill in all required fields" });
            return;
        }
        
        const values = form.getValues();
        
        // Show loading
        webix.message({ type: "info", text: "Logging in..." });
        
        const result = await authService.login(values.email, values.password, values.remember);
        
        if (result.success) {
            webix.message({ type: "success", text: "Login successful!" });
            
            // Navigate to settings or main app
            this.show("/settings?section=account");
        } else {
            $$("loginError").setHTML(`
                <div style="color: #d9534f; text-align: center; padding: 10px;">
                    ${result.error}
                </div>
            `);
            webix.message({ type: "error", text: result.error });
        }
    }
}
