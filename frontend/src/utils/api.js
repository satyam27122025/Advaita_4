export function getApiBase() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("cerebro_api_url");
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/$/, "");
    }
  }
  return (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

export function setCustomApiBase(url) {
  if (typeof window !== "undefined") {
    if (!url || !url.trim()) {
      localStorage.removeItem("cerebro_api_url");
    } else {
      localStorage.setItem("cerebro_api_url", url.trim().replace(/\/$/, ""));
    }
    window.dispatchEvent(new CustomEvent("cerebro_api_url_changed"));
  }
}

export const API_BASE = getApiBase();

async function request(path, options = {}) {
  const base = getApiBase();
  const apiRoot = `${base}/api`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(`${apiRoot}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });
  } catch (error) {
    window.clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out. Confirm the Django server is running on ${base}.`);
    }
    throw new Error(`Unable to reach backend. Confirm the Django server is running on ${base}.`);
  }
  window.clearTimeout(timeoutId);

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    if (typeof payload === "string") {
      throw new Error(payload || "Request failed");
    }
    throw new Error(payload?.detail || payload?.error || "Request failed");
  }

  return payload;
}

export const api = {
  get baseUrl() {
    return getApiBase();
  },
  get apiRoot() {
    return `${getApiBase()}/api`;
  },
  healthCheck(customUrl = null) {
    const base = customUrl ? customUrl.replace(/\/$/, "") : getApiBase();
    return fetch(`${base}/`, { method: "GET" }).then(async (response) => {
      if (!response.ok) {
        throw new Error("Backend unavailable");
      }
      return response.json();
    });
  },
  createRoom(payload) {
    return request("/create-room", { method: "POST", body: JSON.stringify(payload) });
  },
  joinRoom(roomCode, listenerId) {

  return request("/join-room", {
    method: "POST",
    body: JSON.stringify({
      room_code: roomCode,
      listener_id: listenerId
    })
  });

},

  getRoomState(roomCode) {
    return request(`/room-state/${roomCode}`);
  },
  async checkRoomCode(roomCode) {
    const normalized = (roomCode || "").trim().toUpperCase();
    if (!normalized) {
      return { available: false, reason: "missing" };
    }

    try {
      await this.getRoomState(normalized);
      return { available: false, reason: "taken" };
    } catch (error) {
      if (String(error.message || "").includes("Not found")) {
        return { available: true, reason: "available" };
      }
      if (String(error.message || "").includes("No Room matches")) {
        return { available: true, reason: "available" };
      }
      throw error;
    }
  },
  updateRoomState(roomCode, payload) {
    return request(`/room-state/${roomCode}/update`, { method: "POST", body: JSON.stringify(payload) });
  },
};
