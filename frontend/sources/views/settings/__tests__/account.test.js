import AccountSettingsView from '../account';
import authService from '../../../services/authService';

// Mock authService
jest.mock('../../../services/authService');

// Mock webix
global.webix = {
	rules: {
		isNotEmpty: jest.fn((value) => !!value && value.trim() !== '')
	},
	message: jest.fn(),
	alert: jest.fn(),
	extend: jest.fn(),
	ProgressBar: {}
};

describe('AccountSettingsView', () => {
	let view;
	let mockApp;
	let mockForm;

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();
		
		// Mock app
		mockApp = {
			attachEvent: jest.fn(),
			callEvent: jest.fn()
		};

		// Mock form
		mockForm = {
			setValues: jest.fn(),
			getValues: jest.fn(() => ({
				firstName: 'John',
				surname: 'Doe',
				email: 'john@example.com',
				country: 'us',
				countryCode: '+1',
				phoneNumber: '1234567890',
				dateOfBirth: '1990-01-01',
				gender: 'male'
			})),
			validate: jest.fn(),
			showProgress: jest.fn(),
			hideProgress: jest.fn(),
			markAsClean: jest.fn(),
			isDirty: jest.fn(),
			getDirtyValues: jest.fn(),
			clear: jest.fn(),
			clearValidation: jest.fn(),
			define: jest.fn(),
			refresh: jest.fn(),
			getChildViews: jest.fn(() => [])
		};

		view = new AccountSettingsView(mockApp);
		view.$$ = jest.fn((id) => {
			if (id === 'account:form') return mockForm;
			if (id === 'account:edit') return {
				define: jest.fn(),
				refresh: jest.fn()
			};
			if (id === 'account:pwdform') return {
				...mockForm,
				getValues: jest.fn(() => ({
					currentPassword: 'oldpass123',
					newPassword: 'newpass123',
					confirmPassword: 'newpass123'
				}))
			};
			return null;
		});
	});

	describe('Initialization', () => {
		test('should initialize with correct default state', () => {
			expect(view._editing).toBe(false);
			expect(view._passwordWin).toBeNull();
			expect(view._saving).toBe(false);
		});

		test('should register settings section change listener', () => {
			view.init();
			expect(mockApp.attachEvent).toHaveBeenCalled();
		});
	});

	describe('Form Configuration', () => {
		test('should return valid form configuration', () => {
			const config = view.config();
			
			expect(config.view).toBe('form');
			expect(config.id).toBe('account:form');
			expect(config.elements).toBeDefined();
			expect(Array.isArray(config.elements)).toBe(true);
		});

		test('should have all required form fields', () => {
			const config = view.config();
			const elements = config.elements;
			
			// Recursively collect field names from nested elements
			const collectFieldNames = (elements) => {
				const names = [];
				elements.forEach(el => {
					if (el.name) {
						names.push(el.name);
					}
					if (el.cols) {
						names.push(...collectFieldNames(el.cols));
					}
					if (el.rows) {
						names.push(...collectFieldNames(el.rows));
					}
					if (el.elements) {
						names.push(...collectFieldNames(el.elements));
					}
				});
				return names;
			};
			
			const fieldNames = collectFieldNames(elements);

			expect(fieldNames).toContain('firstName');
			expect(fieldNames).toContain('surname');
			expect(fieldNames).toContain('email');
			expect(fieldNames).toContain('country');
			expect(fieldNames).toContain('phoneNumber');
			expect(fieldNames).toContain('dateOfBirth');
			expect(fieldNames).toContain('gender');
		});

		test('should have validation rules', () => {
			const config = view.config();
			
			expect(config.rules).toBeDefined();
			expect(config.rules.firstName).toBeDefined();
			expect(config.rules.surname).toBeDefined();
			expect(config.rules.email).toBeDefined();
			expect(config.rules.dateOfBirth).toBeDefined();
		});

		test('email validation should work correctly', () => {
			const config = view.config();
			const emailRule = config.rules.email;

			expect(emailRule('test@example.com')).toBe(true);
			expect(emailRule('invalid-email')).toBe(false);
			expect(emailRule('test@')).toBe(false);
			expect(emailRule('')).toBe(false);
		});

		test('dateOfBirth validation should reject future dates', () => {
			const config = view.config();
			const dateRule = config.rules.dateOfBirth;

			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			expect(dateRule(yesterday.toISOString())).toBe(true);

			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			expect(dateRule(tomorrow.toISOString())).toBe(false);

			expect(dateRule('')).toBe(true); // Empty is allowed
		});
	});

	describe('Profile Loading', () => {
		test('should load profile successfully', async () => {
			const mockUser = {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				country: 'us',
				countryCode: '+1',
				phone: '1234567890',
				dateOfBirth: '1990-01-01',
				gender: 'male'
			};

			authService.getProfile.mockResolvedValue({
				success: true,
				user: mockUser
			});

			await view._loadProfile();

			expect(mockForm.showProgress).toHaveBeenCalled();
			expect(mockForm.setValues).toHaveBeenCalledWith({
				firstName: 'John',
				surname: 'Doe',
				email: 'john@example.com',
				country: 'us',
				countryCode: '+1',
				phoneNumber: '1234567890',
				dateOfBirth: '1990-01-01',
				gender: 'male'
			});
			expect(mockForm.hideProgress).toHaveBeenCalled();
		});

	test('should handle profile loading error', async () => {
		authService.getProfile.mockResolvedValue({
			success: false,
			error: 'Failed to load'
		});

		await view._loadProfile();

		expect(webix.message).toHaveBeenCalledWith({
			type: 'error',
			text: 'Failed to load'
		});
		expect(mockForm.hideProgress).toHaveBeenCalled();
	});
});

describe('Edit Mode Toggle', () => {
	test('should toggle editing state', async () => {
		mockForm.validate.mockReturnValue(true);
		authService.updateProfile.mockResolvedValue({ success: true });
		authService.getProfile.mockResolvedValue({ success: true, user: {} });
		
		view._setEditing = jest.fn();
		
		await view._toggleEditing();
		expect(view._setEditing).toHaveBeenCalledWith(true);

		view._editing = true;
		await view._toggleEditing();
		expect(view._setEditing).toHaveBeenCalledWith(false);
	});

	test('should save profile when leaving edit mode', async () => {
		view._editing = true;
		mockForm.validate.mockReturnValue(true);
		authService.updateProfile.mockResolvedValue({ success: true });
		authService.getProfile.mockResolvedValue({ success: true, user: {} });
		view._saveProfile = jest.fn();

		await view._toggleEditing();

		expect(view._saveProfile).toHaveBeenCalled();
	});
});
	describe('Profile Saving', () => {
		beforeEach(() => {
			mockForm.getValues.mockReturnValue({
				firstName: 'John',
				surname: 'Doe',
				email: 'john@example.com',
				country: 'us',
				countryCode: '+1',
				phoneNumber: '1234567890',
				dateOfBirth: '1990-01-01',
				gender: 'male'
			});
		});

		test('should save profile successfully', async () => {
			mockForm.validate.mockReturnValue(true);
			authService.updateProfile.mockResolvedValue({
				success: true,
				message: 'Profile updated'
			});
			authService.getProfile.mockResolvedValue({
				success: true,
				user: {}
			});

			await view._saveProfile();

			expect(mockForm.validate).toHaveBeenCalled();
			expect(authService.updateProfile).toHaveBeenCalled();
			expect(webix.message).toHaveBeenCalledWith({
				type: 'success',
				text: 'Profile updated'
			});
			expect(mockForm.hideProgress).toHaveBeenCalled();
		});

		test('should show validation errors', async () => {
			mockForm.validate.mockReturnValue(false);
			mockForm.getValues.mockReturnValue({
				firstName: '',
				surname: '',
				email: 'invalid-email',
				dateOfBirth: '2030-01-01'
			});

			await view._saveProfile();

			expect(webix.message).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'error'
				})
			);
			expect(authService.updateProfile).not.toHaveBeenCalled();
		});

		test('should handle email duplication error', async () => {
			mockForm.validate.mockReturnValue(true);
			authService.updateProfile.mockResolvedValue({
				success: false,
				details: {
					email: ['This email is already in use']
				}
			});

			await view._saveProfile();

			expect(webix.message).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'error',
					text: expect.stringContaining('Email Error')
				})
			);
		});

		test('should not save if already saving', async () => {
			view._saving = true;

			await view._saveProfile();

			expect(mockForm.validate).not.toHaveBeenCalled();
			expect(authService.updateProfile).not.toHaveBeenCalled();
		});
	});

	describe('Password Change', () => {
		test('should show password dialog', () => {
			view.ui = jest.fn((config) => {
				return {
					show: jest.fn(),
					hide: jest.fn()
				};
			});

			view._showPasswordDialog();

			expect(view._passwordWin).toBeDefined();
		});

		test('should submit password change successfully', async () => {
			const mockPwdForm = {
				validate: jest.fn(() => true),
				getValues: jest.fn(() => ({
					currentPassword: 'oldpass123',
					newPassword: 'newpass123',
					confirmPassword: 'newpass123'
				})),
				showProgress: jest.fn(),
				hideProgress: jest.fn(),
				clear: jest.fn()
			};

			view.$$ = jest.fn((id) => {
				if (id === 'account:pwdform') return mockPwdForm;
				return null;
			});

			view._passwordWin = {
				hide: jest.fn()
			};

			authService.changePassword.mockResolvedValue({
				success: true,
				message: 'Password changed'
			});

			await view._submitPassword();

			expect(authService.changePassword).toHaveBeenCalledWith(
				'oldpass123',
				'newpass123',
				'newpass123'
			);
			expect(webix.message).toHaveBeenCalledWith({
				type: 'success',
				text: 'Password changed'
			});
			expect(view._passwordWin.hide).toHaveBeenCalled();
		});

		test('should handle password change error', async () => {
			const mockPwdForm = {
				validate: jest.fn(() => true),
				getValues: jest.fn(() => ({
					currentPassword: 'wrongpass',
					newPassword: 'newpass123',
					confirmPassword: 'newpass123'
				})),
				showProgress: jest.fn(),
				hideProgress: jest.fn()
			};

			view.$$ = jest.fn((id) => {
				if (id === 'account:pwdform') return mockPwdForm;
				return null;
			});

			authService.changePassword.mockResolvedValue({
				success: false,
				error: 'Current password is incorrect'
			});

			await view._submitPassword();

			expect(webix.message).toHaveBeenCalledWith({
				type: 'error',
				text: 'Current password is incorrect'
			});
		});
	});

	describe('Auto-save Functionality', () => {
		test('should auto-save if form is dirty', async () => {
			mockForm.isDirty.mockReturnValue(true);
			view._saveProfile = jest.fn();

			await view._autoSaveIfDirty();

			expect(view._saveProfile).toHaveBeenCalled();
		});

		test('should not auto-save if form is clean', async () => {
			mockForm.isDirty.mockReturnValue(false);
			mockForm.getDirtyValues.mockReturnValue({});
			view._saveProfile = jest.fn();

			await view._autoSaveIfDirty();

			expect(view._saveProfile).not.toHaveBeenCalled();
		});

		test('should not auto-save if already saving', async () => {
			view._saving = true;
			mockForm.isDirty.mockReturnValue(true);
			view._saveProfile = jest.fn();

			await view._autoSaveIfDirty();

			expect(view._saveProfile).not.toHaveBeenCalled();
		});
	});
});
