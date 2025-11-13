# Samsara REST API

Typed, ESM-first JavaScript/TypeScript client for the Samsara REST API.

## Features

- **Spec-accurate typing** powered by `openapi-typescript`, so both requests and responses reflect the exact Samsara contract in `samsara-api.json`.
- **Dual-runtime output** via `tsup`, shipping `dist/index.mjs`, `dist/index.cjs`, and `.d.ts` bundles for any JavaScript environment.
- **Resource helpers** such as `client.fleet`, `client.cameras`, `client.safety`, and `client.tachograph` that collapse verbose REST calls into readable method names.
- **Escape hatches** through `client.request` and `client.requestRaw`, letting you pick between strict path validation or fully dynamic requests.
- **Fetch-first design** keeps the SDK browser-friendly; provide your own `fetch` implementation for Node, SSR, or serverless runtimes.

## Installation

```bash
npm install samsara-sdk
```

The package ships with dual ESM/CJS builds and bundled declaration files. It targets modern browsers (ES2020) – in Node.js you must provide a `fetch` implementation (for example [`undici`](https://github.com/nodejs/undici)).

## Quick start

```ts
import { SamsaraClient } from 'samsara-sdk';

const client = new SamsaraClient({
  token: process.env.SAMSARA_TOKEN!,
  timeoutMs: 10_000,
});

const vehicles = await client.fleet.listVehicles({
  query: { limit: 25 },
});

console.log(vehicles.data.data.map((vehicle) => vehicle.name));
```

### Fully typed raw requests

`SamsaraClient.request` enforces the correct path/method pairing and auto-completes query/body structures derived from the OpenAPI spec.

```ts
const response = await client.request({
  path: '/fleet/documents',
  method: 'get',
  query: {
    limit: 50,
    after: cursor,
  },
});

response.data.pagination?.endCursor; // fully typed
```

Need to call an endpoint dynamically? Use `client.requestRaw({ path: string, method: string, ... })` to skip compile-time validation.

### Fleet helper

Convenience methods wrap the raw `request` API for common workflows:

```ts
// Fetch a specific vehicle
const vehicle = await client.fleet.getVehicle('12345');

// Update a driver
await client.fleet.updateDriver('driver_1', {
  name: 'Alex Doe',
  phone: '+14155550123',
});

// Create a document
const doc = await client.fleet.createDocument({
  driverId: 'driver_1',
  documentTypeId: 'pretrip',
  fields: [
    { label: 'Trailer', value: 'TL-18' },
  ],
});
```

All helper methods return the same `SamsaraResponse<T>` structure exposed by `request`, so you always get `{ data, status, headers, requestId }`.

### Cameras helper

```ts
// Request uploaded media within a window
const media = await client.cameras.listMedia({
  query: { startTime: '2024-01-01T00:00:00Z', endTime: '2024-01-02T00:00:00Z' },
});

// Kick off a retrieval for higher resolution footage
await client.cameras.createMediaRetrieval({
  deviceId: 'VG123',
  startTime: '2024-01-01T12:00:00Z',
  endTime: '2024-01-01T12:00:15Z',
});
```

### Safety helper

```ts
// Stream safety events while handling pagination cursors
const events = await client.safety.streamEvents({
  query: { limit: 50, after: cursor },
});

// Fetch safety scores across your tagged drivers
const scores = await client.safety.listDriverScores({
  query: { tagIds: ['team-a'] },
});
```

### Tachograph helper

```ts
// Fetch activity across multiple drivers
const activity = await client.tachograph.listDriverActivity({
  query: { driverIds: ['driver_1', 'driver_2'], startTime, endTime },
});

// Download vehicle tachograph files over a range
const files = await client.tachograph.listVehicleFiles({
  query: { vehicleIds: ['veh-1'], startTime, endTime },
});
```

## Available helpers & endpoints

- **Core client**
  - `client.request({ path, method })` enforces valid path/method pairs with inferred query/body contracts.
  - `client.requestRaw({ path, method })` skips compile-time validation so you can hit experimental or private endpoints.
- **FleetApi (`client.fleet`)** – vehicles, drivers, assignments, and documents: `listVehicles`, `getVehicle`, `updateVehicle`, `listDrivers`, `createDriver`, `getDriver`, `updateDriver`, `listDriverVehicleAssignments`, `getVehicleStats`, `getVehicleLocations`, `listDocuments`, `createDocument`, `getDocument`, `deleteDocument`.
- **CamerasApi (`client.cameras`)** – media capture: `listMedia`, `getMediaRetrieval`, `createMediaRetrieval`.
- **SafetyApi (`client.safety`)** – events and scorecards: `listEvents`, `streamEvents`, `listDriverScores`, `listDriverTripScores`, `listTagGroupScores`, `listTagScores`, `listVehicleScores`, `listVehicleTripScores`, `streamDetections`.
- **TachographApi (`client.tachograph`)** – EU compliance data: `listDriverActivity`, `listDriverFiles`, `listVehicleFiles`.

## Configuration reference

| Option | Description |
| --- | --- |
| `baseUrl` | Override the default `https://api.samsara.com` host (useful for sandbox or proxying).
| `token` | Static API token/OAuth access token. Sent as `Authorization: Bearer <token>`.
| `getToken` | Lazy token resolver invoked before each request. Handy for refreshing OAuth tokens.
| `fetch` | Custom `fetch` implementation. Required when running under Node.js versions without global `fetch`.
| `timeoutMs` | Default per-request timeout in milliseconds. Requests automatically abort when exceeded.
| `defaultHeaders` | Headers merged into every request (e.g., custom `User-Agent`).

Per-request overrides (`signal`, `timeoutMs`, custom headers, alternate `baseUrl`, etc.) are available on both `request` and helper methods.

## Regenerating types

The SDK keeps the OpenAPI document (`samsara-api.json`) checked into the repo. When Samsara publishes an updated spec, download the new JSON and regenerate types:

```bash
curl -L https://developers.samsara.com/openapi/samsara-api.json -o samsara-api.json
npm run generate
```

This refreshes `src/generated/openapi.ts`, which powers all of the request & response typing.

## Development

```bash
npm run typecheck   # strict TypeScript checks
npm run build       # emits dist/ (ESM + CJS + .d.ts)
```

The package is MIT licensed. See [LICENSE](./LICENSE) for details.
