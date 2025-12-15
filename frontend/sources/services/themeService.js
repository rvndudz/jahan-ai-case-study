const STORAGE_KEY = "settings:themePreference";
const ACCENT_KEY = "settings:accentPreference";
const ALLOWED = ["light", "dark", "system"];
const ACCENTS = {
	blue:  { hex:"#0ea5e9", soft:"rgba(14, 165, 233, 0.2)" },
	emerald:{ hex:"#10b981", soft:"rgba(16, 185, 129, 0.2)" },
	amber: { hex:"#f59e0b", soft:"rgba(245, 158, 11, 0.22)" },
	indigo:{ hex:"#6366f1", soft:"rgba(99, 102, 241, 0.22)" }
};

const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
const listeners = new Set();

let currentPreference = readStoredPreference();
let currentAccent = readStoredAccent();
let initialized = false;

function readStoredPreference(){
	const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
	return ALLOWED.includes(saved) ? saved : "system";
}

function readStoredAccent(){
	const saved = (localStorage.getItem(ACCENT_KEY) || "").toLowerCase();
	return ACCENTS[saved] ? saved : "blue";
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

function handleSystemChange(){
	if (currentPreference === "system"){
		applyTheme(currentPreference);
	}
}

export function initTheme(){
	if (initialized){
		applyTheme(currentPreference);
		applyAccent(currentAccent);
		return;
	}

	currentPreference = readStoredPreference();
	currentAccent = readStoredAccent();
	applyTheme(currentPreference);
	applyAccent(currentAccent);
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
