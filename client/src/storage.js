export function getStoredValue(key, fallback = null) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch (_error) {
    return fallback;
  }
}

export function setStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (_error) {
    // Storage can be blocked in some browser/privacy modes.
  }
}

export function removeStoredValue(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (_error) {
    // Storage can be blocked in some browser/privacy modes.
  }
}
