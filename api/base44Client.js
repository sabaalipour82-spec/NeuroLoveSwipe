// src/api/base44Client.js

const APP_ID = "6927463809836f52137c27e9";
const API_KEY = "b297656328944ed190de5088f923d4f7";

const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "api_key": API_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Base44 error:", res.status, text);
    throw new Error(`Base44 error ${res.status}: ${text}`);
  }

  return res.json();
}

// helper to build ?param=value query strings
function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const base44 = {
  entities: {
    GameSession: {
      // CREATE a new GameSession
      async create(data) {
        return request(`/entities/GameSession`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },

      // GET list of GameSessions (optionally filtered)
      async filter(filters = {}) {
        const qs = buildQuery(filters);
        return request(`/entities/GameSession${qs}`);
      },

      // UPDATE one GameSession by ID
      async update(id, data) {
        return request(`/entities/GameSession/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },

      // DELETE a GameSession by ID
      async delete(id) {
        return request(`/entities/GameSession/${id}`, {
          method: "DELETE",
        });
      },
    },

    Player: {
      // CREATE a new Player
      async create(data) {
        return request(`/entities/Player`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },

      // GET list of Players (optionally filtered)
      async filter(filters = {}) {
        const qs = buildQuery(filters);
        return request(`/entities/Player${qs}`);
      },

      // UPDATE one Player by ID
      async update(id, data) {
        return request(`/entities/Player/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },

      // DELETE a Player by ID
      async delete(id) {
        return request(`/entities/Player/${id}`, {
          method: "DELETE",
        });
      },
    },
  },
};
