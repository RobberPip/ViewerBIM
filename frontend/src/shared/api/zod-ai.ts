import { z } from "zod";

export type Body_chat_with_files_ai_chat_post = z.infer<typeof Body_chat_with_files_ai_chat_post>;
export const Body_chat_with_files_ai_chat_post = z.object({
  prompt: z.string(),
  files: z.array(z.string()),
});

export type ValidationError = z.infer<typeof ValidationError>;
export const ValidationError = z.object({
  loc: z.array(z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])),
  msg: z.string(),
  type: z.string(),
});

export type HTTPValidationError = z.infer<typeof HTTPValidationError>;
export const HTTPValidationError = z.object({
  detail: z.array(ValidationError).optional(),
});

export type JsonResponse = z.infer<typeof JsonResponse>;
export const JsonResponse = z.object({
  item_ids: z.string(),
});

export type post_Chat_with_files_ai_chat_post = typeof post_Chat_with_files_ai_chat_post;
export const post_Chat_with_files_ai_chat_post = {
  method: z.literal("POST"),
  path: z.literal("/ai/chat"),
  requestFormat: z.literal("form-data"),
  parameters: z.object({
    body: Body_chat_with_files_ai_chat_post,
  }),
  response: JsonResponse,
};

// <EndpointByMethod>
export const EndpointByMethod = {
  post: {
    "/ai/chat": post_Chat_with_files_ai_chat_post,
  },
};
export type EndpointByMethod = typeof EndpointByMethod;
// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type PostEndpoints = EndpointByMethod["post"];
export type AllEndpoints = EndpointByMethod[keyof EndpointByMethod];
// </EndpointByMethod.Shorthands>

// <ApiClientTypes>
export type EndpointParameters = {
  body?: unknown;
  query?: Record<string, unknown>;
  header?: Record<string, unknown>;
  path?: Record<string, unknown>;
};

export type MutationMethod = "post" | "put" | "patch" | "delete";
export type Method = "get" | "head" | "options" | MutationMethod;

type RequestFormat = "json" | "form-data" | "form-url" | "binary" | "text";

export type DefaultEndpoint = {
  parameters?: EndpointParameters | undefined;
  response: unknown;
};

export type Endpoint<TConfig extends DefaultEndpoint = DefaultEndpoint> = {
  operationId: string;
  method: Method;
  path: string;
  requestFormat: RequestFormat;
  parameters?: TConfig["parameters"];
  meta: {
    alias: string;
    hasParameters: boolean;
    areParametersRequired: boolean;
  };
  response: TConfig["response"];
};

type Fetcher = (
  method: Method,
  url: string,
  parameters?: EndpointParameters | undefined,
) => Promise<Endpoint["response"]>;

type RequiredKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? never : P;
}[keyof T];

type MaybeOptionalArg<T> = RequiredKeys<T> extends never ? [config?: T] : [config: T];

// </ApiClientTypes>

// <ApiClient>
export class ApiClient {
  baseUrl: string = "";

  constructor(public fetcher: Fetcher) {}

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    return this;
  }

  // <ApiClient.post>
  post<Path extends keyof PostEndpoints, TEndpoint extends PostEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<z.infer<TEndpoint["parameters"]>>
  ): Promise<z.infer<TEndpoint["response"]>> {
    return this.fetcher("post", this.baseUrl + path, params[0]) as Promise<z.infer<TEndpoint["response"]>>;
  }
  // </ApiClient.post>
}

export function createApiClient(fetcher: Fetcher, baseUrl?: string) {
  return new ApiClient(fetcher).setBaseUrl(baseUrl ?? "");
}

/**
 Example usage:
 const api = createApiClient((method, url, params) =>
   fetch(url, { method, body: JSON.stringify(params) }).then((res) => res.json()),
 );
 api.get("/users").then((users) => console.log(users));
 api.post("/users", { body: { name: "John" } }).then((user) => console.log(user));
 api.put("/users/:id", { path: { id: 1 }, body: { name: "John" } }).then((user) => console.log(user));
*/

// </ApiClient
