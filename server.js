import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";
const TRACKS_URL = "https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson";

const cache = new Map();

const localDriverStandings = [
  ["1", "NOR", "Lando Norris", "McLaren", "77", "#FF8000"],
  ["2", "PIA", "Oscar Piastri", "McLaren", "74", "#FF8000"],
  ["3", "VER", "Max Verstappen", "Red Bull Racing", "69", "#3671C6"],
  ["4", "RUS", "George Russell", "Mercedes", "63", "#27F4D2"],
  ["5", "LEC", "Charles Leclerc", "Ferrari", "32", "#E80020"],
  ["6", "HAM", "Lewis Hamilton", "Ferrari", "31", "#E80020"],
  ["7", "ANT", "Andrea Kimi Antonelli", "Mercedes", "30", "#27F4D2"],
  ["8", "ALB", "Alexander Albon", "Williams", "18", "#64C4FF"],
  ["9", "OCO", "Esteban Ocon", "Haas", "14", "#B6BABD"],
  ["10", "STR", "Lance Stroll", "Aston Martin", "10", "#229971"],
  ["11", "GAS", "Pierre Gasly", "Alpine", "6", "#0093CC"],
  ["12", "HAD", "Isack Hadjar", "Racing Bulls", "5", "#6692FF"],
  ["13", "ALO", "Fernando Alonso", "Aston Martin", "4", "#229971"],
  ["14", "TSU", "Yuki Tsunoda", "Red Bull Racing", "3", "#3671C6"],
  ["15", "SAI", "Carlos Sainz", "Williams", "2", "#64C4FF"],
  ["16", "BEA", "Oliver Bearman", "Haas", "1", "#B6BABD"],
  ["17", "LAW", "Liam Lawson", "Racing Bulls", "0", "#6692FF"],
  ["18", "HUL", "Nico Hülkenberg", "Audi Revolut F1 Team", "0", "audi"],
  ["19", "BOR", "Gabriel Bortoleto", "Audi Revolut F1 Team", "0", "audi"],
  ["20", "DOO", "Jack Doohan", "Alpine", "0", "#0093CC"]
];

const localConstructorStandings = [
  ["1", "McLaren", "British", "151", "#FF8000"],
  ["2", "Mercedes", "German", "93", "#27F4D2"],
  ["3", "Red Bull Racing", "Austrian", "72", "#3671C6"],
  ["4", "Ferrari", "Italian", "63", "#E80020"],
  ["5", "Williams", "British", "20", "#64C4FF"],
  ["6", "Haas", "American", "15", "#B6BABD"],
  ["7", "Aston Martin", "British", "14", "#229971"],
  ["8", "Alpine", "French", "6", "#0093CC"],
  ["9", "Racing Bulls", "Italian", "5", "#6692FF"],
  ["10", "Audi Revolut F1 Team", "German", "0", "audi"]
];

const localCalendar = [
  {
    season: "2026",
    round: "7",
    raceName: "Miami Grand Prix",
    date: "2026-05-03",
    time: "22:00:00Z",
    Circuit: {
      circuitId: "miami",
      circuitName: "Miami International Autodrome",
      Location: { locality: "Miami", country: "USA", lat: "25.9581", long: "-80.2389" }
    },
    FirstPractice: { date: "2026-05-01", time: "18:30:00Z" },
    SprintQualifying: { date: "2026-05-01", time: "22:30:00Z" },
    Sprint: { date: "2026-05-02", time: "18:00:00Z" },
    Qualifying: { date: "2026-05-02", time: "22:00:00Z" }
  },
  {
    season: "2026",
    round: "8",
    raceName: "Grand Prix d'Émilie-Romagne",
    date: "2026-05-17",
    time: "13:00:00Z",
    Circuit: {
      circuitId: "imola",
      circuitName: "Autodromo Enzo e Dino Ferrari",
      Location: { locality: "Imola", country: "Italy", lat: "44.3439", long: "11.7167" }
    },
    FirstPractice: { date: "2026-05-15", time: "11:30:00Z" },
    SecondPractice: { date: "2026-05-15", time: "15:00:00Z" },
    ThirdPractice: { date: "2026-05-16", time: "10:30:00Z" },
    Qualifying: { date: "2026-05-16", time: "14:00:00Z" }
  },
  {
    season: "2026",
    round: "9",
    raceName: "Grand Prix de Monaco",
    date: "2026-05-24",
    time: "13:00:00Z",
    Circuit: {
      circuitId: "monaco",
      circuitName: "Circuit de Monaco",
      Location: { locality: "Monte-Carlo", country: "Monaco", lat: "43.7347", long: "7.4206" }
    },
    FirstPractice: { date: "2026-05-22", time: "11:30:00Z" },
    SecondPractice: { date: "2026-05-22", time: "15:00:00Z" },
    ThirdPractice: { date: "2026-05-23", time: "10:30:00Z" },
    Qualifying: { date: "2026-05-23", time: "14:00:00Z" }
  }
];

const localLastResult = {
  raceName: "Saudi Arabian Grand Prix",
  round: "5",
  date: "2026-04-19",
  time: "17:00:00Z",
  Circuit: {
    circuitName: "Jeddah Corniche Circuit",
    Location: { locality: "Jeddah", country: "Saudi Arabia" }
  },
  Results: [
    {
      position: "1",
      points: "25",
      status: "Finished",
      Driver: { givenName: "Oscar", familyName: "Piastri", code: "PIA" },
      Constructor: { name: "McLaren", constructorId: "mclaren" }
    },
    {
      position: "2",
      points: "18",
      status: "Finished",
      Driver: { givenName: "Max", familyName: "Verstappen", code: "VER" },
      Constructor: { name: "Red Bull Racing", constructorId: "red_bull" }
    },
    {
      position: "3",
      points: "15",
      status: "Finished",
      Driver: { givenName: "Charles", familyName: "Leclerc", code: "LEC" },
      Constructor: { name: "Ferrari", constructorId: "ferrari" }
    }
  ]
};

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function setCached(key, value, ttlMs) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

async function fetchJson(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "apex-halo-pit-wall/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function cachedFetchJson(key, url, ttlMs = 60000, timeoutMs = 10000) {
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchJson(url, timeoutMs);
  setCached(key, data, ttlMs);
  return data;
}

function normalizeTeamKey(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function teamColor(teamName = "", constructorId = "") {
  const all = `${normalizeTeamKey(teamName)} ${normalizeTeamKey(constructorId)}`;

  if (all.includes("ferrari")) return "#E80020";
  if (all.includes("mclaren")) return "#FF8000";
  if (all.includes("red_bull")) return "#3671C6";
  if (all.includes("mercedes")) return "#27F4D2";
  if (all.includes("aston")) return "#229971";
  if (all.includes("alpine")) return "#0093CC";
  if (all.includes("williams")) return "#64C4FF";
  if (all.includes("haas")) return "#B6BABD";
  if (all.includes("racing_bulls") || all.includes("visa") || all.includes("rb_f1")) return "#6692FF";
  if (all.includes("audi") || all.includes("revolut") || all.includes("sauber") || all.includes("kick")) return "audi";
  if (all.includes("cadillac")) return "#C9A227";

  return "#B6BABD";
}

function driverCode(driver = {}) {
  return (
    driver.code ||
    driver.permanentNumber ||
    `${driver.givenName?.[0] || ""}${driver.familyName?.[0] || ""}`.toUpperCase() ||
    "--"
  );
}

function normalizeDriverStanding(row) {
  const driver = row.Driver || {};
  const constructor = row.Constructors?.[0] || {};

  return [
    row.position || "-",
    driverCode(driver),
    `${driver.givenName || ""} ${driver.familyName || ""}`.trim() || driver.driverId || "--",
    constructor.name || "--",
    row.points || "0",
    teamColor(constructor.name, constructor.constructorId)
  ];
}

function normalizeConstructorStanding(row) {
  const constructor = row.Constructor || {};

  return [
    row.position || "-",
    constructor.name || constructor.constructorId || "--",
    constructor.nationality || "--",
    row.points || "0",
    teamColor(constructor.name, constructor.constructorId)
  ];
}

function sendOk(res, payload) {
  res.json({ ok: true, ...payload });
}

function sendLocal(res, payload) {
  res.json({ ok: true, source: "local", ...payload });
}

async function getJolpicaRaces(season) {
  const data = await cachedFetchJson(
    `jolpica:races:${season}`,
    `${JOLPICA_BASE}/${season}.json?limit=100`,
    30 * 60000
  );

  return data?.MRData?.RaceTable?.Races || [];
}

async function getJolpicaStandings(season) {
  const [driverData, constructorData] = await Promise.all([
    cachedFetchJson(
      `jolpica:driverstandings:${season}`,
      `${JOLPICA_BASE}/${season}/driverstandings.json?limit=100`,
      30 * 60000
    ),
    cachedFetchJson(
      `jolpica:constructorstandings:${season}`,
      `${JOLPICA_BASE}/${season}/constructorstandings.json?limit=100`,
      30 * 60000
    ).catch(() => null)
  ]);

  const drivers =
    driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.map(normalizeDriverStanding) ||
    [];

  const constructors =
    constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.map(
      normalizeConstructorStanding
    ) || [];

  return { drivers, constructors };
}

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  sendOk(res, {
    source: "server",
    time: new Date().toISOString(),
    cacheSize: cache.size
  });
});

app.get("/api/calendar", async (req, res) => {
  const season = String(req.query.season || "current");

  try {
    const races = await getJolpicaRaces(season);

    if (races.length) {
      return sendOk(res, {
        source: "jolpica",
        season,
        races
      });
    }
  } catch (error) {
    console.warn("[calendar] API failed:", error.message);
  }

  return sendLocal(res, {
    season,
    races: localCalendar
  });
});

app.get("/api/standings", async (req, res) => {
  const season = String(req.query.season || "current");

  try {
    let standings = await getJolpicaStandings(season);
    const hasPoints = standings.drivers.some(row => Number(row[4]) > 0);

    if (!hasPoints && season !== "2025") {
      standings = await getJolpicaStandings("2025");
    }

    if (standings.drivers.length) {
      return sendOk(res, {
        source: "jolpica",
        season,
        drivers: standings.drivers,
        constructors: standings.constructors.length ? standings.constructors : localConstructorStandings
      });
    }
  } catch (error) {
    console.warn("[standings] API failed:", error.message);
  }

  return sendLocal(res, {
    season,
    drivers: localDriverStandings,
    constructors: localConstructorStandings
  });
});

app.get("/api/results", async (req, res) => {
  const season = String(req.query.season || "current");

  try {
    const data = await cachedFetchJson(
      `jolpica:last-results:${season}`,
      `${JOLPICA_BASE}/${season}/last/results.json?limit=100`,
      30 * 60000
    );

    const race = data?.MRData?.RaceTable?.Races?.[0];

    if (race) {
      return sendOk(res, {
        source: "jolpica",
        season,
        race
      });
    }
  } catch (error) {
    console.warn("[results] API failed:", error.message);
  }

  return sendLocal(res, {
    season,
    race: localLastResult
  });
});

app.get("/api/weather", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return sendLocal(res, {
      weather: {
        temp: 21,
        wind: 3,
        rain: 0
      }
    });
  }

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    "&current=temperature_2m,wind_speed_10m,precipitation" +
    "&hourly=precipitation_probability" +
    "&forecast_days=1" +
    "&timezone=auto";

  try {
    const data = await cachedFetchJson(`weather:${lat}:${lon}`, url, 10 * 60000);

    const temp = data?.current?.temperature_2m;
    const wind = data?.current?.wind_speed_10m;
    const rain = data?.hourly?.precipitation_probability?.[0];

    return sendOk(res, {
      source: "open-meteo",
      weather: {
        temp: Number.isFinite(temp) ? Math.round(temp) : 21,
        wind: Number.isFinite(wind) ? Math.round(wind) : 3,
        rain: Number.isFinite(rain) ? Math.round(rain) : 0
      }
    });
  } catch (error) {
    console.warn("[weather] API failed:", error.message);

    return sendLocal(res, {
      weather: {
        temp: 21,
        wind: 3,
        rain: 0
      }
    });
  }
});

app.get("/api/live", async (req, res) => {
  try {
    const ttl = 8000;

    const [sessions, drivers, positions, intervals, locations] = await Promise.all([
      cachedFetchJson("openf1:sessions:latest", `${OPENF1_BASE}/sessions?session_key=latest`, ttl),
      cachedFetchJson("openf1:drivers:latest", `${OPENF1_BASE}/drivers?session_key=latest`, ttl),
      cachedFetchJson("openf1:positions:latest", `${OPENF1_BASE}/position?session_key=latest`, ttl),
      cachedFetchJson("openf1:intervals:latest", `${OPENF1_BASE}/intervals?session_key=latest`, ttl).catch(() => []),
      cachedFetchJson("openf1:locations:latest", `${OPENF1_BASE}/location?session_key=latest`, ttl).catch(() => [])
    ]);

    const live =
      Array.isArray(drivers) &&
      drivers.length > 0 &&
      Array.isArray(positions) &&
      positions.length > 0;

    return sendOk(res, {
      source: "openf1",
      live,
      session: Array.isArray(sessions) ? sessions[0] || null : null,
      drivers: Array.isArray(drivers) ? drivers : [],
      positions: Array.isArray(positions) ? positions : [],
      intervals: Array.isArray(intervals) ? intervals : [],
      locations: Array.isArray(locations) ? locations : []
    });
  } catch (error) {
    console.warn("[live] API failed:", error.message);

    return res.json({
      ok: false,
      source: "openf1",
      live: false,
      error: error.message,
      session: null,
      drivers: [],
      positions: [],
      intervals: [],
      locations: []
    });
  }
});

app.get("/api/tracks", async (req, res) => {
  try {
    const geojson = await cachedFetchJson("tracks:geojson", TRACKS_URL, 7 * 24 * 60 * 60000, 15000);

    return sendOk(res, {
      source: "bacinger/f1-circuits",
      geojson
    });
  } catch (error) {
    console.warn("[tracks] API failed:", error.message);

    return res.json({
      ok: false,
      source: "local",
      geojson: null,
      error: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Apex Halo Pit Wall lancé : http://localhost:${PORT}`);
});
