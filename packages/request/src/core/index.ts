import { GetParams } from '@org/ts-utils';
import axios, { Axios, AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import merge from 'lodash.merge';
import { interceptors } from 'node_modules/axios/index.cjs';

type Updater<S, R = S> = (state: S) => R | void;

const resolveUpdate = <S, R = S>(nextState: R | Updater<S, R>, state: S) => {
  const setter =
    typeof nextState === 'function'
      ? (nextState as Updater<S>)
      : () => nextState;
  return setter(state);
};

type AxiosRequestConfigWithStringLiteralURL<URL extends string, D = any> = Omit<
  AxiosRequestConfig<D>,
  'url'
> & {
  url?: URL;
};

type AxiosRequestConfigWithURLParams<
  URL extends string,
  URLParams = GetParams<URL>,
  D = any
> = AxiosRequestConfigWithStringLiteralURL<URL, D> & {
  urlParams?: {} extends URLParams ? Record<string, any> : URLParams;
};

type AxiosConfigWithTypedParams<
  URL extends string,
  Params extends object = {},
  D = any
> = AxiosRequestConfigWithURLParams<URL, D> & {
  params?: Params;
};

type AnyAxiosConfig = AxiosConfigWithTypedParams<any, any, any>;

type AnyAxiosHeader = Exclude<AnyAxiosConfig['headers'], undefined>;

type AxiosInterceptors = Axios['interceptors'];
type AxiosRequestInterceptorManager = AxiosInterceptors['request'];
type AxiosResponseInterceptorManager = AxiosInterceptors['response'];

type AxiosRequestInterceptorParameters = Parameters<
  AxiosRequestInterceptorManager['use']
>;
type AxiosResponseInterceptorParameters = Parameters<
  AxiosResponseInterceptorManager['use']
>;

type AxiosRequestInterceptorDefinition = {
  onFulfilled?: AxiosRequestInterceptorParameters[0];
  onRejected?: AxiosRequestInterceptorParameters[1];
};
type AxiosResponseInterceptorDefinition = {
  onFulfilled?: AxiosResponseInterceptorParameters[0];
  onRejected?: AxiosResponseInterceptorParameters[1];
};

class SharedResourceMethods<
  GlobalParams extends object = {},
  GlobalURL extends string = string,
  GlobalData = any
> {
  protected config: AnyAxiosConfig = {};
  constructor(config: AnyAxiosConfig = {}) {
    this.config = config;
  }

  setMethod(method: Method) {
    this.config.method = method;
    return this;
  }

  setURL<URL extends string>(url: URL) {
    this.config.url += url;
    return this as unknown as SharedResourceMethods<
      GlobalParams,
      `${GlobalURL}${URL}`,
      GlobalData
    >;
  }

  setURLParams(updater: GetParams<GlobalURL> | Updater<GetParams<GlobalURL>>) {
    const nextState = resolveUpdate(
      updater,
      this.config.urlParams || ({} as any)
    );
    if (nextState) {
      this.config.headers = nextState;
    }
    return this;
  }

  setHeaders(updater: AnyAxiosHeader | Updater<AnyAxiosHeader>) {
    const nextState = resolveUpdate(updater, this.config.headers || {});
    if (nextState) {
      this.config.headers = nextState;
    }
    return this;
  }

  setParams<Params extends object>(
    updater: Params | Updater<GlobalParams, GlobalParams & Params>
  ) {
    const nextState = resolveUpdate(updater, this.config.params || {});
    if (nextState) {
      this.config.params = nextState;
    }
    return this as SharedResourceMethods<
      GlobalParams & Params,
      GlobalURL,
      GlobalData
    >;
  }

  setData<D>(updater: D | Updater<D>) {
    const nextState = resolveUpdate(updater, this.config.data || {});
    if (nextState) {
      this.config.data = nextState;
    }
    return this as SharedResourceMethods<
      GlobalParams,
      GlobalURL,
      GlobalData & D
    >;
  }
}

type InterceptorsDefinition = {
  request: AxiosRequestInterceptorDefinition[];
  response: AxiosResponseInterceptorDefinition[];
};

export class Resource<
  Params extends object = {},
  URL extends string = string,
  Data = any
> extends SharedResourceMethods<Params, URL> {
  private abortController: AbortController = new AbortController();
  private axiosInstance: AxiosInstance;
  private interceptorsDefinition: InterceptorsDefinition | undefined;
  private requestInterceptorsIds = new Map();
  private responseInterceptorsIds = new Map();

  private bindInterceptors(interceptorsDefinition: InterceptorsDefinition) {
    interceptorsDefinition.request.forEach(({ onFulfilled, onRejected }) => {
      if (onFulfilled || onRejected) {
        const id = this.axiosInstance.interceptors.request.use(
          onFulfilled,
          onRejected
        );
        this.requestInterceptorsIds.set(onFulfilled, id);
        this.requestInterceptorsIds.set(onRejected, id);
      }
    });
    interceptorsDefinition.response.forEach(({ onFulfilled, onRejected }) => {
      if (onFulfilled || onRejected) {
        const id = this.axiosInstance.interceptors.response.use(
          onFulfilled,
          onRejected
        );
        this.responseInterceptorsIds.set(onFulfilled, id);
        this.responseInterceptorsIds.set(onRejected, id);
      }
    });
  }

  constructor(
    config: AxiosConfigWithTypedParams<URL, Params>,
    interceptorsDefinition?: InterceptorsDefinition
  ) {
    super(config);
    this.axiosInstance = axios.create(config);
    if (interceptorsDefinition) {
      this.interceptorsDefinition = interceptorsDefinition;
      this.bindInterceptors(interceptorsDefinition);
    }
  }

  ejectRequestInterceptor(fn: Function) {
    const id = this.requestInterceptorsIds.get(fn);
    if (id !== undefined) {
      this.axiosInstance.interceptors.request.eject(id);
    }
  }

  ejectResponseInterceptor(fn: Function) {
    const id = this.responseInterceptorsIds.get(fn);
    if (id !== undefined) {
      this.axiosInstance.interceptors.response.eject(id);
    }
  }

  private getConfigComputedFields() {
    const url = replaceParams(this.config.url, this.config.urlParams);
    return {
      url,
    };
  }

  override setParams<InnerParams extends object>(
    updater: InnerParams | Updater<Params, InnerParams & Params>
  ): Resource<Params & InnerParams, URL, Data> {
    super.setParams(updater);
    return this as Resource<Params & InnerParams, URL, Data>;
  }

  override setURL<InnerURL extends string>(
    url: InnerURL
  ): Resource<Params, `${URL}${InnerURL}`, Data> {
    super.setURL(url);
    return this as Resource<Params, `${URL}${InnerURL}`, Data>;
  }

  cancel(reason?: any) {
    this.abortController.abort(reason);
    this.abortController = new AbortController();
  }

  fork() {
    return new Resource<Params, URL, Data>(
      this.config,
      this.interceptorsDefinition
    );
  }

  request(config?: Partial<AxiosConfigWithTypedParams<URL, Params>>) {
    const mergedConfig = merge(
      {},
      this.config,
      config,
      this.getConfigComputedFields(),
      {
        signal: this.abortController.signal,
      }
    );
    return this.axiosInstance(mergedConfig);
  }
}

const REPLACE_PATTERN = /:([^/]*)/g;

const replaceParams = <U extends string>(
  url: U,
  params?: Partial<GetParams<U>>
) => {
  const computedParams = (params || {}) as Record<string, string>;
  return url.replace(
    REPLACE_PATTERN,
    (key) => computedParams[key.slice(1)] ?? ''
  );
};

type InterceptorsFromBuilder = {
  requestInterceptors: AxiosRequestInterceptorDefinition[];
  responseInterceptors: AxiosResponseInterceptorDefinition[];
};

export class ResourceBuilder<
  GlobalParams extends object = {},
  GlobalURL extends string = string,
  GlobalData extends Record<string, any> = any
> extends SharedResourceMethods<GlobalParams, GlobalURL, GlobalData> {
  private requestInterceptors: AxiosRequestInterceptorDefinition[] = [];
  private responseInterceptors: AxiosResponseInterceptorDefinition[] = [];
  constructor(
    config: AxiosConfigWithTypedParams<
      GlobalURL,
      GlobalParams,
      GlobalData
    > = {},
    interceptors?: InterceptorsFromBuilder
  ) {
    super(config);
    if (interceptors) {
      this.requestInterceptors = interceptors.requestInterceptors;
      this.responseInterceptors = interceptors.responseInterceptors;
    }
  }

  setBaseURL<URL extends string>(url: URL) {
    this.config.baseURL = url;
    return this as unknown as ResourceBuilder<GlobalParams, URL, GlobalData>;
  }

  override setURL<URL extends string>(
    url: URL
  ): ResourceBuilder<GlobalParams, `${GlobalURL}${URL}`, GlobalData> {
    super.setURL(url);
    return this as unknown as ResourceBuilder<
      GlobalParams,
      `${GlobalURL}${URL}`,
      GlobalData
    >;
  }

  override setParams<Params extends object>(
    updater: Params | Updater<GlobalParams, GlobalParams & Params>
  ): ResourceBuilder<GlobalParams & Params, GlobalURL, GlobalData> {
    super.setParams(updater);
    return this;
  }

  setRequestInterceptor(interceptor: AxiosRequestInterceptorDefinition) {
    this.requestInterceptors.push(interceptor);
    return this;
  }

  setResponseInterceptor(interceptor: AxiosResponseInterceptorDefinition) {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  fork() {
    return new ResourceBuilder<GlobalParams, GlobalURL, GlobalData>(
      this.config as any,
      {
        requestInterceptors: this.requestInterceptors,
        responseInterceptors: this.responseInterceptors,
      }
    );
  }

  build() {
    return new Resource<GlobalParams, GlobalURL, GlobalData>(
      this.config as unknown as AxiosRequestConfigWithURLParams<GlobalURL>,
      {
        request: this.requestInterceptors,
        response: this.responseInterceptors,
      }
    );
  }
}
