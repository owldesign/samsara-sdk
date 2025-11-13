import type { RequestExecutor, RequestOptions } from '../core/types';

export class TachographApi {
  constructor(private readonly executor: RequestExecutor) {}

  listDriverActivity(options?: RequestOptions<'/fleet/drivers/tachograph-activity/history', 'get'>) {
    return this.executor.request({
      path: '/fleet/drivers/tachograph-activity/history',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listDriverFiles(options?: RequestOptions<'/fleet/drivers/tachograph-files/history', 'get'>) {
    return this.executor.request({
      path: '/fleet/drivers/tachograph-files/history',
      method: 'get',
      ...(options ?? {}),
    });
  }

  listVehicleFiles(options?: RequestOptions<'/fleet/vehicles/tachograph-files/history', 'get'>) {
    return this.executor.request({
      path: '/fleet/vehicles/tachograph-files/history',
      method: 'get',
      ...(options ?? {}),
    });
  }
}
