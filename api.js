// api.js

const APP_ID = "6927463809836f52137c27e9";
const API_KEY = "b297656328944ed190de5088f923d4f7";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}`;

// Generic helper for all requests
async function base44Fetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      api_key: API_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Base44 error:", response.status, text);
    throw new Error(`Base44 error ${response.status}: ${text}`);
  }

  return response.json();
}

/* ===================== GAMESESSION ===================== */

// GET all or filtered GameSession entities
// filters can be: session_code, status, difficulty, etc.
export async function fetchGameSessions(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : "";
  return base44Fetch(`/entities/GameSession${query}`);
}

// UPDATE one GameSession by ID
export async function updateGameSession(entityId, updateData) {
  return base44Fetch(`/entities/GameSession/${entityId}`, {
    method: "PUT",
    body: JSON.stringify(updateData)
  });
}

// OPTIONAL: CREATE a GameSession (if you want host to create sessions from app)
export async function createGameSession(sessionData) {
  return base44Fetch(`/entities/GameSession`, {
    method: "POST",
    body: JSON.stringify(sessionData)
  });
}

/* ======================== PLAYER ======================== */

// GET all or filtered Player entities
// filters can be: session_id, name, is_active, etc.
export async function fetchPlayers(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : "";
  return base44Fetch(`/entities/Player${query}`);
}

// UPDATE one Player by ID
export async function updatePlayer(entityId, updateData) {
  return base44Fetch(`/entities/Player/${entityId}`, {
    method: "PUT",
    body: JSON.stringify(updateData)
  });
}

// OPTIONAL: CREATE a Player (when someone joins the session)
export async function createPlayer(playerData) {
  return base44Fetch(`/entities/Player`, {
    method: "POST",
    body: JSON.stringify(playerData)
  });
}
