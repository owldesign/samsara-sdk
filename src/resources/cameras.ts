import type { RequestExecutor, RequestOptions } from '../core/types';
import { BodyInput, Without } from './helpers';

export class CamerasApi {
  constructor(private readonly executor: RequestExecutor) {}

  listMedia(options?: RequestOptions<'/cameras/media', 'get'>) {
    return this.executor.request({
      path: '/cameras/media',
      method: 'get',
      ...(options ?? {}),
    });
  }

  getMediaRetrieval(options?: RequestOptions<'/cameras/media/retrieval', 'get'>) {
    return this.executor.request({
      path: '/cameras/media/retrieval',
      method: 'get',
      ...(options ?? {}),
    });
  }

  createMediaRetrieval(
    body: BodyInput<'/cameras/media/retrieval', 'post'>,
    options?: Without<RequestOptions<'/cameras/media/retrieval', 'post'>, 'body'>
  ) {
    return this.executor.request({
      path: '/cameras/media/retrieval',
      method: 'post',
      ...(options ?? {}),
      body,
    });
  }
}
