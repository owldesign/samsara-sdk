import assert from 'node:assert/strict';
import test from 'node:test';

import { SamsaraApiError, SamsaraClient } from '../dist/index.mjs';

const createMockFetch = (responses, calls = []) => {
  return async (input, init) => {
    if (responses.length === 0) {
      throw new Error('No mock responses remaining');
    }

    const next = responses.shift();
    const targetUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url: targetUrl, init });

    const headers = new Headers(next.headers);
    const needsJsonHeader = next.body && typeof next.body === 'object' && !(next.body instanceof ArrayBuffer);
    if (needsJsonHeader && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    let payload = null;
    if (next.body !== undefined) {
      payload =
        typeof next.body === 'string' || next.body instanceof ArrayBuffer || ArrayBuffer.isView(next.body)
          ? next.body
          : JSON.stringify(next.body);
    }

    return new Response(payload, {
      status: next.status,
      headers,
    });
  };
};

test('supports cursor-based pagination flows without hitting the live API', async () => {
  const calls = [];
  const mockFetch = createMockFetch(
    [
      {
        status: 200,
        body: {
          data: [{ id: 'veh-1' }],
          pagination: { hasNextPage: true, endCursor: 'cursor-1' },
        },
        headers: { 'x-request-id': 'req-1' },
      },
      {
        status: 200,
        body: {
          data: [{ id: 'veh-2' }],
          pagination: { hasNextPage: false, endCursor: 'cursor-2' },
        },
        headers: { 'x-request-id': 'req-2' },
      },
    ],
    calls
  );

  const client = new SamsaraClient({
    token: 'test-token',
    fetch: mockFetch,
    baseUrl: 'https://mock.samsara',
  });

  const firstPage = await client.fleet.listVehicles({ query: { limit: 1 } });
  const firstPayload = firstPage.data;
  assert.equal(firstPayload.data.length, 1);
  assert.equal(firstPayload.pagination?.endCursor, 'cursor-1');

  const secondPage = await client.fleet.listVehicles({
    query: { limit: 1, after: firstPayload.pagination?.endCursor },
  });
  const secondPayload = secondPage.data;

  assert.equal(secondPayload.data[0]?.id, 'veh-2');
  assert.equal(secondPayload.pagination?.endCursor, 'cursor-2');

  assert.equal(calls.length, 2);
  const firstUrl = new URL(calls[0].url);
  assert.equal(firstUrl.pathname, '/fleet/vehicles');
  assert.equal(firstUrl.searchParams.get('limit'), '1');

  const secondUrl = new URL(calls[1].url);
  assert.equal(secondUrl.searchParams.get('after'), 'cursor-1');
});

test('surfaces API errors with response metadata when fetch rejects the request', async () => {
  const mockFetch = createMockFetch([
    {
      status: 429,
      body: { code: 'rate_limit', message: 'Too many requests' },
      headers: { 'x-request-id': 'req-429' },
    },
  ]);

  const client = new SamsaraClient({ token: 'test-token', fetch: mockFetch });

  await assert.rejects(async () => client.fleet.listVehicles(), (error) => {
    assert.ok(error instanceof SamsaraApiError);
    assert.equal(error.status, 429);
    assert.deepEqual(error.data, { code: 'rate_limit', message: 'Too many requests' });
    assert.equal(error.requestId, 'req-429');
    return true;
  });
});
