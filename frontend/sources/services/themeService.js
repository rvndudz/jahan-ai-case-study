const STORAGE_KEY = "settings:themePreference";
const ACCENT_KEY = "settings:accentPreference";
const FONT_KEY = "settings:fontFamily";
const FONT_SIZE_KEY = "settings:fontSize";
const ALLOWED = ["light", "dark", "system"];
const ACCENTS = {
	blue:  { hex:"#0ea5e9", soft:"rgba(14, 165, 233, 0.2)" },
	emerald:{ hex:"#10b981", soft:"rgba(16, 185, 129, 0.2)" },
	amber: { hex:"#f59e0b", soft:"rgba(245, 158, 11, 0.22)" },
	indigo:{ hex:"#6366f1", soft:"rgba(99, 102, 241, 0.22)" }
};
const FONTS = {
	inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
	manrope: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
	roboto: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
	workSans: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
};
const FONT_SIZES = {
	small: 13,
	medium: 15,
	large: 17
};

const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
const listeners = new Set();

let currentPreference = readStoredPreference();
let currentAccent = readStoredAccent();
let currentFont = readStoredFont();
let currentFontSize = readStoredFontSize();
let initialized = false;

function readStoredPreference(){
	const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
	return ALLOWED.includes(saved) ? saved : "system";
}

function readStoredAccent(){
	const saved = (localStorage.getItem(ACCENT_KEY) || "").toLowerCase();
	return ACCENTS[saved] ? saved : "blue";
}

function readStoredFont(){
	const saved = (localStorage.getItem(FONT_KEY) || "").toLowerCase();
	return FONTS[saved] ? saved : "inter";
}

function readStoredFontSize(){
	const saved = (localStorage.getItem(FONT_SIZE_KEY) || "").toLowerCase();
	return FONT_SIZES[saved] ? saved : "medium";
}

function persistPreference(value){
	try {
		localStorage.setItem(STORAGE_KEY, value);
	}
	catch (e){
		// ignore storage errors
	}
}

function persistAccent(value){
	try {
		localStorage.setItem(ACCENT_KEY, value);
	}
	catch (e){
		// ignore storage errors
	}
}

function persistFont(value){
	try {
		localStorage.setItem(FONT_KEY, value);
	}
	catch (e){
		// ignore storage errors
	}
}

function persistFontSize(value){
	try {
		localStorage.setItem(FONT_SIZE_KEY, value.toString());
	}
	catch (e){
		// ignore storage errors
	}
}

function resolveTheme(pref = currentPreference){
	if (pref === "system"){
		return mediaQuery && mediaQuery.matches ? "dark" : "light";
	}
	return pref;
}

function notify(activeTheme){
	listeners.forEach(cb => {
		try {
			cb(activeTheme, currentPreference, currentAccent);
		}
		catch (e){
			// ignore subscriber errors
		}
	});
}

function reflowLayoutForTypography(){
	const resize = window.webix?.ui?.resize;
	if (typeof resize === "function"){
		requestAnimationFrame(() => resize());
	}
}

function applyTheme(pref = currentPreference){
	const activeTheme = resolveTheme(pref);
	document.body.classList.toggle("theme-dark", activeTheme === "dark");
	document.body.classList.toggle("theme-light", activeTheme === "light");
	document.documentElement.setAttribute("data-theme", activeTheme);
	notify(activeTheme);
}

function applyAccent(name = currentAccent){
	const accent = ACCENTS[name] || ACCENTS.blue;
	document.documentElement.style.setProperty("--settings-accent", accent.hex);
	document.documentElement.style.setProperty("--settings-accent-soft", accent.soft);
}

function applyFont(name = currentFont){
	const fontFamily = FONTS[name] || FONTS.inter;
	
	// Create or update style tag for font
	let styleTag = document.getElementById('custom-font-family');
	if (!styleTag) {
		styleTag = document.createElement('style');
		styleTag.id = 'custom-font-family';
		document.head.appendChild(styleTag);
	}
	
	// Apply font broadly but exclude icon elements
	styleTag.textContent = `
		body,
		.webix_view,
		.webix_el_box, 
		.webix_inp_static,
		.webix_el_text input,
		.webix_el_combo input,
		.webix_el_select select,
		.webix_inp_textarea,
		.webix_button,
		.webix_list_item,
		.webix_item_tab,
		.webix_template,
		input,
		textarea,
		select,
		button,
		.webix_el_label,
		.settings-nav__text,
		.settings-tab__text {
			font-family: ${fontFamily} !important;
		}
	`;

	if (initialized){
		// Recalculate view heights so typography changes don't clip text
		reflowLayoutForTypography();
	}
}

function applyFontSize(sizeName = currentFontSize){
	const fontSize = FONT_SIZES[sizeName] || FONT_SIZES.medium;
	
	// Set base font size on html element for rem calculations
	document.documentElement.style.fontSize = fontSize + 'px';
	
	// Create or update style tag for font size
	let styleTag = document.getElementById('custom-font-size');
	if (!styleTag) {
		styleTag = document.createElement('style');
		styleTag.id = 'custom-font-size';
		document.head.appendChild(styleTag);
	}
	
	// Apply font size but exclude icons, checkboxes, radio buttons, and switches
	styleTag.textContent = `
		body {
			font-size: 1rem;
		}
		body *:not(.webix_icon):not([class*="wxi-"]):not([type="checkbox"]):not([type="radio"]):not(.webix_checkbox):not(.webix_radio):not(.webix_switch):not(.webix_switch_box):not(.webix_switch_handle):not(.webix_custom_checkbox):not(.webix_custom_radio) {
			font-size: inherit;
		}
	`;

	if (initialized){
		// Reflow the layout after the base font size shifts to avoid clipped captions
		reflowLayoutForTypography();
	}
}

function handleSystemChange(){
	if (currentPreference === "system"){
		applyTheme(currentPreference);
	}
}

export function initTheme(){
	if (initialized){
		applyTheme(currentPreference);
		applyAccent(currentAccent);
		applyFont(currentFont);
		applyFontSize(currentFontSize);
		return;
	}

	currentPreference = readStoredPreference();
	currentAccent = readStoredAccent();
	currentFont = readStoredFont();
	currentFontSize = readStoredFontSize();
	applyTheme(currentPreference);
	applyAccent(currentAccent);
	applyFont(currentFont);
	applyFontSize(currentFontSize);
	initialized = true;

	if (mediaQuery){
		if (mediaQuery.addEventListener){
			mediaQuery.addEventListener("change", handleSystemChange);
		}
		else if (mediaQuery.addListener){
			mediaQuery.addListener(handleSystemChange);
		}
	}
}

export function setThemePreference(pref){
	const next = ALLOWED.includes(pref) ? pref : "system";
	currentPreference = next;
	persistPreference(next);
	applyTheme(next);
	return resolveTheme(next);
}

export function getThemePreference(){
	return currentPreference;
}

export function getActiveTheme(){
	return resolveTheme(currentPreference);
}

export function setAccentPreference(name){
	const key = ACCENTS[name] ? name : "blue";
	currentAccent = key;
	persistAccent(key);
	applyAccent(key);
	return key;
}

export function getAccentPreference(){
	return currentAccent;
}

export function subscribeThemeChange(callback){
	if (typeof callback !== "function"){
		return () => {};
	}
	listeners.add(callback);
	return () => listeners.delete(callback);
}

export function setFontFamily(name){
	const key = FONTS[name] ? name : "inter";
	currentFont = key;
	persistFont(key);
	applyFont(key);
	return key;
}

export function getFontFamily(){
	return currentFont;
}

export function setFontSize(sizeName){
	const validSize = FONT_SIZES[sizeName] ? sizeName : "medium";
	currentFontSize = validSize;
	persistFontSize(validSize);
	applyFontSize(validSize);
	return validSize;
}

export function getFontSize(){
	return currentFontSize;
}
