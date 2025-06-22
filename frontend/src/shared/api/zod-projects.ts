import { z } from "zod";

export type IssueUploadForm = z.infer<typeof IssueUploadForm>;
export const IssueUploadForm = z.object({
  projectId: z.union([z.string(), z.undefined()]).optional(),
  file: z.string(),
});

export type LoaderIn = z.infer<typeof LoaderIn>;
export const LoaderIn = z.object({
  projectId: z.string().optional(),
  ifcFiles: z.union([z.array(z.string()), z.null()]).optional(),
});

export type LoadersOut = z.infer<typeof LoadersOut>;
export const LoadersOut = z.object({
  id: z.union([z.string(), z.undefined()]).optional(),
  name: z.union([z.string(), z.null()]),
  linkIFC: z.union([z.string(), z.null()]),
  createdAt: z.union([z.string(), z.undefined()]).optional(),
  updatedAt: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export type ProjectsIn = z.infer<typeof ProjectsIn>;
export const ProjectsIn = z.object({
  name: z.union([z.string(), z.null()]),
  description: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export type UsersOut = z.infer<typeof UsersOut>;
export const UsersOut = z.object({
  id: z.string().optional(),
  login: z.union([z.string(), z.null()]).optional(),
  firstName: z.union([z.string(), z.null()]).optional(),
  lastName: z.union([z.string(), z.null()]).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  companyWebsite: z.union([z.string(), z.null()]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.union([z.string(), z.null()]).optional(),
});

export type ProjectsOut = z.infer<typeof ProjectsOut>;
export const ProjectsOut = z.object({
  id: z.string(),
  loadKey: z.string(),
  name: z.union([z.string(), z.null()]),
  description: z.union([z.string(), z.null(), z.undefined()]).optional(),
  loaders: z.union([z.array(LoadersOut), z.null()]),
  users: z.union([z.array(UsersOut), z.null()]),
  createdAt: z.union([z.string(), z.undefined()]).optional(),
  updatedAt: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export type get_ApiprojpprojectsProjectId = typeof get_ApiprojpprojectsProjectId;
export const get_ApiprojpprojectsProjectId = {
  method: z.literal("GET"),
  path: z.literal("/api/proj/p/projects/{projectId}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      projectId: z.string(),
    }),
    header: z.object({
      UserId: z.string().optional(),
    }),
  }),
  response: ProjectsOut,
};

export type get_Apiprojpprojects = typeof get_Apiprojpprojects;
export const get_Apiprojpprojects = {
  method: z.literal("GET"),
  path: z.literal("/api/proj/p/projects"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    header: z.object({
      UserId: z.string().optional(),
    }),
  }),
  response: z.array(ProjectsOut),
};

export type post_Apiprojpprojectsadd = typeof post_Apiprojpprojectsadd;
export const post_Apiprojpprojectsadd = {
  method: z.literal("POST"),
  path: z.literal("/api/proj/p/projects/add"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    header: z.object({
      UserId: z.string().optional(),
    }),
    body: ProjectsIn,
  }),
  response: ProjectsOut,
};

export type post_ApiprojpprojectsProjectIdinvite = typeof post_ApiprojpprojectsProjectIdinvite;
export const post_ApiprojpprojectsProjectIdinvite = {
  method: z.literal("POST"),
  path: z.literal("/api/proj/p/projects/{projectId}/invite"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      projectId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type get_Apiprojpprojectsjoin = typeof get_Apiprojpprojectsjoin;
export const get_Apiprojpprojectsjoin = {
  method: z.literal("GET"),
  path: z.literal("/api/proj/p/projects/join"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    query: z.object({
      token: z.string(),
    }),
    header: z.object({
      UserId: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type post_Apiprojpissuesadd = typeof post_Apiprojpissuesadd;
export const post_Apiprojpissuesadd = {
  method: z.literal("POST"),
  path: z.literal("/api/proj/p/issues/add"),
  requestFormat: z.literal("form-data"),
  parameters: z.object({
    header: z.object({
      UserId: z.string().optional(),
    }),
    body: IssueUploadForm,
  }),
  response: z.unknown(),
};

export type delete_ApiprojpissuesIssueId = typeof delete_ApiprojpissuesIssueId;
export const delete_ApiprojpissuesIssueId = {
  method: z.literal("DELETE"),
  path: z.literal("/api/proj/p/issues/{issueId}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      issueId: z.string(),
    }),
    header: z.object({
      UserId: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_ApiprojpissuesProjectId = typeof get_ApiprojpissuesProjectId;
export const get_ApiprojpissuesProjectId = {
  method: z.literal("GET"),
  path: z.literal("/api/proj/p/issues/{projectId}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      projectId: z.string(),
    }),
    header: z.object({
      UserId: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type post_Apiprojploadersupload = typeof post_Apiprojploadersupload;
export const post_Apiprojploadersupload = {
  method: z.literal("POST"),
  path: z.literal("/api/proj/p/loaders/upload"),
  requestFormat: z.literal("form-data"),
  parameters: z.object({
    header: z.object({
      UserId: z.string().optional(),
    }),
    body: LoaderIn,
  }),
  response: z.unknown(),
};

export type get_ApiprojpissuesfileIssueId = typeof get_ApiprojpissuesfileIssueId;
export const get_ApiprojpissuesfileIssueId = {
  method: z.literal("GET"),
  path: z.literal("/api/proj/p/issues/file/{issueId}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      issueId: z.string(),
    }),
    header: z.object({
      UserId: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

// <EndpointByMethod>
export const EndpointByMethod = {
  get: {
    "/api/proj/p/projects/{projectId}": get_ApiprojpprojectsProjectId,
    "/api/proj/p/projects": get_Apiprojpprojects,
    "/api/proj/p/projects/join": get_Apiprojpprojectsjoin,
    "/api/proj/p/issues/{projectId}": get_ApiprojpissuesProjectId,
    "/api/proj/p/issues/file/{issueId}": get_ApiprojpissuesfileIssueId,
  },
  post: {
    "/api/proj/p/projects/add": post_Apiprojpprojectsadd,
    "/api/proj/p/projects/{projectId}/invite": post_ApiprojpprojectsProjectIdinvite,
    "/api/proj/p/issues/add": post_Apiprojpissuesadd,
    "/api/proj/p/loaders/upload": post_Apiprojploadersupload,
  },
  delete: {
    "/api/proj/p/issues/{issueId}": delete_ApiprojpissuesIssueId,
  },
};
export type EndpointByMethod = typeof EndpointByMethod;
// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type GetEndpoints = EndpointByMethod["get"];
export type PostEndpoints = EndpointByMethod["post"];
export type DeleteEndpoints = EndpointByMethod["delete"];
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

  // <ApiClient.get>
  get<Path extends keyof GetEndpoints, TEndpoint extends GetEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<z.infer<TEndpoint["parameters"]>>
  ): Promise<z.infer<TEndpoint["response"]>> {
    return this.fetcher("get", this.baseUrl + path, params[0]) as Promise<z.infer<TEndpoint["response"]>>;
  }
  // </ApiClient.get>

  // <ApiClient.post>
  post<Path extends keyof PostEndpoints, TEndpoint extends PostEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<z.infer<TEndpoint["parameters"]>>
  ): Promise<z.infer<TEndpoint["response"]>> {
    return this.fetcher("post", this.baseUrl + path, params[0]) as Promise<z.infer<TEndpoint["response"]>>;
  }
  // </ApiClient.post>

  // <ApiClient.delete>
  delete<Path extends keyof DeleteEndpoints, TEndpoint extends DeleteEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<z.infer<TEndpoint["parameters"]>>
  ): Promise<z.infer<TEndpoint["response"]>> {
    return this.fetcher("delete", this.baseUrl + path, params[0]) as Promise<z.infer<TEndpoint["response"]>>;
  }
  // </ApiClient.delete>
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
