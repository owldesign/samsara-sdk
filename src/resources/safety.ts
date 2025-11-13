import type { RequestExecutor, RequestOptions } from '../core/types';

export class SafetyApi {
  constructor(private readonly executor: RequestExecutor) {}

  listEvents(options?: RequestOptions<'/safety-events', 'get'>) {
    return this.executor.request({
      path: '/safety-events',
      method: 'get',
      ...(options ?? {}),
    });
  }

  streamEvents(options?: RequestOptions<'/safety-events/stream', 'get'>) {
    return this.executor.request({
      path: '/safety-events/stream',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listDriverScores(options?: RequestOptions<'/safety-scores/drivers', 'get'>) {
    return this.executor.request({
      path: '/safety-scores/drivers',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listDriverTripScores(options?: RequestOptions<'/safety-scores/drivers/trips', 'get'>) {
    return this.executor.request({
      path: '/safety-scores/drivers/trips',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listTagGroupScores(options?: RequestOptions<'/safety-scores/tag-group', 'get'>) {
    return this.executor.request({
      path: '/safety-scores/tag-group',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listTagScores(options?: RequestOptions<'/safety-scores/tags', 'get'>) {
    return this.executor.request({
      path: '/safety-scores/tags',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listVehicleScores(options?: RequestOptions<'/safety-scores/vehicles', 'get'>) {
    return this.executor.request({
      path: '/safety-scores/vehicles',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listVehicleTripScores(options?: RequestOptions<'/safety-scores/vehicles/trips', 'get'>) {
    return this.executor.request({
      path: '/safety-scores/vehicles/trips',
      method: 'get',
      ...(options ?? {}),
    });
  }

  streamDetections(options?: RequestOptions<'/detections/stream', 'get'>) {
    return this.executor.request({
      path: '/detections/stream',
      method: 'get',
      ...(options ?? {}),
    });
  }
}
