import type { paths } from '../generated/openapi';

export type PathKey = keyof paths;
export type MethodForPath<Path extends PathKey> = keyof paths[Path];
export type HttpMethod = 'get' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'delete';

export type OperationFor<Path extends PathKey, Method extends MethodForPath<Path>> = paths[Path][Method];

type ExtractParameters<Operation, Key extends 'path' | 'query' | 'header'> = Operation extends {
  parameters: infer Params;
}
  ? Key extends keyof Params
    ? NonNullable<Params[Key]>
    : never
  : never;

export type OperationPathParams<Operation> = ExtractParameters<Operation, 'path'>;
export type OperationQueryParams<Operation> = ExtractParameters<Operation, 'query'>;
export type OperationHeaderParams<Operation> = ExtractParameters<Operation, 'header'>;

type ContentTypeValue<Content> = Content extends Record<string, unknown>
  ? keyof Content extends never
    ? never
    : Content[keyof Content]
  : never;

export type OperationRequestBody<Operation> = Operation extends {
  requestBody: infer RequestBody;
}
  ? RequestBody extends { content: infer Content }
    ? ContentTypeValue<Content>
    : never
  : never;

export type OperationRequestContentType<Operation> = Operation extends {
  requestBody: infer RequestBody;
}
  ? RequestBody extends { content: infer Content }
    ? keyof Content & string
    : never
  : never;

type OperationResponses<Operation> = Operation extends { responses: infer Responses } ? Responses : never;

type SuccessfulResponseContent<Responses> = {
  [Status in keyof Responses]: Status extends `${number}`
    ? Status extends `2${string}`
      ? Responses[Status] extends { content: infer Content }
        ? ContentTypeValue<Content> extends never
          ? void
          : ContentTypeValue<Content>
        : void
      : never
    : never;
}[keyof Responses];

export type OperationSuccessBody<Operation> = OperationResponses<Operation> extends never
  ? void
  : Exclude<SuccessfulResponseContent<OperationResponses<Operation>>, never> extends never
    ? void
    : Exclude<SuccessfulResponseContent<OperationResponses<Operation>>, never>;

export type RequestConfig<Path extends PathKey, Method extends MethodForPath<Path>> = {
  path: Path;
  method: Method;
  pathParams?: OperationPathParams<OperationFor<Path, Method>>;
  query?: OperationQueryParams<OperationFor<Path, Method>>;
  headers?: HeadersInit;
  body?: OperationRequestBody<OperationFor<Path, Method>> extends never
    ? never
    : OperationRequestBody<OperationFor<Path, Method>> | BodyInit;
  contentType?: OperationRequestContentType<OperationFor<Path, Method>>;
  signal?: AbortSignal;
  timeoutMs?: number;
  baseUrl?: string;
};

export interface RawRequestConfig {
  path: string;
  method: HttpMethod | Uppercase<HttpMethod>;
  pathParams?: Record<string, string | number>;
  query?: Record<string, unknown>;
  headers?: HeadersInit;
  body?: BodyInit | Record<string, unknown>;
  contentType?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  baseUrl?: string;
}

export type RequestOptions<Path extends PathKey, Method extends MethodForPath<Path>> = Omit<
  RequestConfig<Path, Method>,
  'path' | 'method'
>;

export interface SamsaraResponse<TData> {
  data: TData;
  status: number;
  headers: Headers;
  requestId?: string | null;
}

export interface RequestExecutor {
  request<Path extends PathKey, Method extends MethodForPath<Path>>(
    config: RequestConfig<Path, Method>
  ): Promise<SamsaraResponse<OperationSuccessBody<OperationFor<Path, Method>>>>;
}
