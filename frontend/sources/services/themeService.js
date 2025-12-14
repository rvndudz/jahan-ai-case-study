const STORAGE_KEY = "settings:themePreference";
const ALLOWED = ["light", "dark", "system"];

const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
const listeners = new Set();

let currentPreference = readStoredPreference();
let initialized = false;

function readStoredPreference(){
	const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
	return ALLOWED.includes(saved) ? saved : "system";
}

function persistPreference(value){
	try {
		localStorage.setItem(STORAGE_KEY, value);
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
			cb(activeTheme, currentPreference);
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

function handleSystemChange(){
	if (currentPreference === "system"){
		applyTheme(currentPreference);
	}
}

export function initTheme(){
	if (initialized){
		applyTheme(currentPreference);
		return;
	}

	currentPreference = readStoredPreference();
	applyTheme(currentPreference);
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

export function subscribeThemeChange(callback){
	if (typeof callback !== "function"){
		return () => {};
	}
	listeners.add(callback);
	return () => listeners.delete(callback);
}
