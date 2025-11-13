import type { RequestExecutor, RequestOptions } from '../core/types';
import { BodyInput, Without, toPathParam } from './helpers';

export class FleetApi {
  constructor(private readonly executor: RequestExecutor) {}

  listVehicles(options?: RequestOptions<'/fleet/vehicles', 'get'>) {
    return this.executor.request({
      path: '/fleet/vehicles',
      method: 'get',
      ...(options ?? {}),
    });
  }

  getVehicle(
    vehicleId: string | number,
    options?: Without<RequestOptions<'/fleet/vehicles/{id}', 'get'>, 'pathParams'>
  ) {
    return this.executor.request({
      path: '/fleet/vehicles/{id}',
      method: 'get',
      ...(options ?? {}),
      pathParams: { id: toPathParam(vehicleId) },
    });
  }

  updateVehicle(
    vehicleId: string | number,
    body: BodyInput<'/fleet/vehicles/{id}', 'patch'>,
    options?: Without<RequestOptions<'/fleet/vehicles/{id}', 'patch'>, 'pathParams' | 'body'>
  ) {
    return this.executor.request({
      path: '/fleet/vehicles/{id}',
      method: 'patch',
      ...(options ?? {}),
      pathParams: { id: toPathParam(vehicleId) },
      body,
    });
  }

  listDrivers(options?: RequestOptions<'/fleet/drivers', 'get'>) {
    return this.executor.request({
      path: '/fleet/drivers',
      method: 'get',
      ...(options ?? {}),
    });
  }

  createDriver(
    body: BodyInput<'/fleet/drivers', 'post'>,
    options?: Without<RequestOptions<'/fleet/drivers', 'post'>, 'body'>
  ) {
    return this.executor.request({
      path: '/fleet/drivers',
      method: 'post',
      ...(options ?? {}),
      body,
    });
  }

  getDriver(
    driverId: string | number,
    options?: Without<RequestOptions<'/fleet/drivers/{id}', 'get'>, 'pathParams'>
  ) {
    return this.executor.request({
      path: '/fleet/drivers/{id}',
      method: 'get',
      ...(options ?? {}),
      pathParams: { id: toPathParam(driverId) },
    });
  }

  updateDriver(
    driverId: string | number,
    body: BodyInput<'/fleet/drivers/{id}', 'patch'>,
    options?: Without<RequestOptions<'/fleet/drivers/{id}', 'patch'>, 'pathParams' | 'body'>
  ) {
    return this.executor.request({
      path: '/fleet/drivers/{id}',
      method: 'patch',
      ...(options ?? {}),
      pathParams: { id: toPathParam(driverId) },
      body,
    });
  }

  listDriverVehicleAssignments(
    options?: RequestOptions<'/fleet/driver-vehicle-assignments', 'get'>
  ) {
    return this.executor.request({
      path: '/fleet/driver-vehicle-assignments',
      method: 'get',
      ...(options ?? {}),
    });
  }

  getVehicleStats(options?: RequestOptions<'/fleet/vehicles/stats', 'get'>) {
    return this.executor.request({
      path: '/fleet/vehicles/stats',
      method: 'get',
      ...(options ?? {}),
    });
  }

  getVehicleLocations(options?: RequestOptions<'/fleet/vehicles/locations', 'get'>) {
    return this.executor.request({
      path: '/fleet/vehicles/locations',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listDocuments(options?: RequestOptions<'/fleet/documents', 'get'>) {
    return this.executor.request({
      path: '/fleet/documents',
      method: 'get',
      ...(options ?? {}),
    });
  }

  createDocument(
    body: BodyInput<'/fleet/documents', 'post'>,
    options?: Without<RequestOptions<'/fleet/documents', 'post'>, 'body'>
  ) {
    return this.executor.request({
      path: '/fleet/documents',
      method: 'post',
      ...(options ?? {}),
      body,
    });
  }

  getDocument(
    documentId: string | number,
    options?: Without<RequestOptions<'/fleet/documents/{id}', 'get'>, 'pathParams'>
  ) {
    return this.executor.request({
      path: '/fleet/documents/{id}',
      method: 'get',
      ...(options ?? {}),
      pathParams: { id: toPathParam(documentId) },
    });
  }

  deleteDocument(
    documentId: string | number,
    options?: Without<RequestOptions<'/fleet/documents/{id}', 'delete'>, 'pathParams'>
  ) {
    return this.executor.request({
      path: '/fleet/documents/{id}',
      method: 'delete',
      ...(options ?? {}),
      pathParams: { id: toPathParam(documentId) },
    });
  }
}
