import proj4 from "proj4";
import * as L from "leaflet";


/**
 * Extracts "EPSG:32643" from things like
 *   • "urn:ogc:def:crs:EPSG::32643"
 *   • "urn:ogc:def:crs:EPSG:6.18:3:4326"
 *   • "EPSG:32643"
 */
export function normaliseEpsg(crsString) {
    const m = String(crsString).match(/EPSG(?::|::)(\d+)/i);
    return m ? `EPSG:${m[1]}` : null;
}

// helper ────────────────────────────────────────────────────────────
export function reprojectGeoJSON(geojson, from, to = "EPSG:4326") {
    const transformer = proj4(from, to);
    const projectPosition = ([x, y]) => transformer.forward([x, y]);

    const walk = coords =>
        typeof coords[0] === "number"
            ? projectPosition(coords)
            : coords.map(walk);

    return JSON.parse(JSON.stringify(geojson, (k, v) =>
        k === "coordinates" ? walk(v) : v
    ));
}

/*
 * Ensure proj4 knows a CRS definition; fetches from epsg.io if missing.
 * @param {string} epsgCode e.g. "EPSG:32643"
 * @returns {Promise<void>}
 */
export async function ensureProj(epsgCode) {
    if (!epsgCode) throw new Error("epsgCode is undefined or empty");

    // Already loaded?
    if (proj4.defs(epsgCode)) return;

    // epsg.io expects just the numeric part → "32643.proj4"
    const numeric = epsgCode.replace(/^EPSG:/i, "");
    const url = `https://epsg.io/${numeric}.proj4`;

    console.log(`↗️  Loading projection ${epsgCode} from ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Could not download ${url} (${res.status})`);
    }

    const definition = (await res.text()).trim();
    if (!definition) throw new Error(`Empty definition for ${epsgCode}`);

    proj4.defs(epsgCode, definition);   // cache for future calls
}

/*
 * Convert [minx, miny, maxx, maxy] in `epsgCode` to a Leaflet LatLngBounds.
 * @param {number[]} bbox
 * @param {string}    epsgCode   e.g. "EPSG:32643"
 * @returns {Promise<L.LatLngBounds>}
 */
export async function bboxToLatLngBounds(bbox, epsgCode) {
    await ensureProj(epsgCode);

    if (!Array.isArray(bbox) || bbox.length !== 4) {
        throw new Error(`bbox must be [minx,miny,maxx,maxy]; got ${JSON.stringify(bbox)}`);
    }

    // Make sure they’re numbers
    const [minx, miny, maxx, maxy] = bbox.map(Number);

    const [west, south] = proj4(epsgCode, "EPSG:4326", [minx, miny]); // [lon, lat]
    const [east, north] = proj4(epsgCode, "EPSG:4326", [maxx, maxy]); // [lon, lat]

    // Quick sanity‑check before Leaflet sees them
    for (const v of [south, north]) {
        if (Math.abs(v) > 90 || !Number.isFinite(v)) {
            throw new Error(`Latitude out of range: ${v}`);
        }
    }
    for (const v of [west, east]) {
        if (Math.abs(v) > 180 || !Number.isFinite(v)) {
            throw new Error(`Longitude out of range: ${v}`);
        }
    }

    return L.latLngBounds([south, west], [north, east]);
}















// import proj4 from "proj4";

/*
 * Ensure a projection is registered in proj4.
 * @param  {string} epsgCode   "EPSG:32643", "EPSG:2403", …
 * @return {Promise<string>}   the PROJ.4 string (resolved when ready)
 */
// export async function ensureProj(epsgCode) {
//     if (proj4.defs[epsgCode]) {
//         // Already loaded
//         return proj4.defs[epsgCode];
//     }

//     try {
//         console.log(`Loading projection definition for ${epsgCode}...`);
//         // epsg.io gives raw PROJ.4 if you hit /{code}.proj4
//         // const url = `https://epsg.io/${epsgCode.split(":")[1]}.proj4`;
//         const url = `https://epsg.io/${epsgCode}.proj4`;
//         const text = await fetch(url).then(r => r.text());

//         if (!text || text.includes("404")) {
//             throw new Error("Definition not found");
//         }

//         proj4.defs(epsgCode, text.trim());
//         return text.trim();
//     } catch (err) {
//         console.error(`Could not load ${epsgCode}:`, err);
//         throw err;
//     }
// }



