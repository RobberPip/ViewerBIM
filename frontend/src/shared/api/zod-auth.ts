import { z } from "zod";

export type AccessTokenResponse = z.infer<typeof AccessTokenResponse>;
export const AccessTokenResponse = z.object({
  tokenType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  accessToken: z.union([z.string(), z.null()]),
  expiresIn: z.number(),
  refreshToken: z.union([z.string(), z.null()]),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequest>;
export const ForgotPasswordRequest = z.object({
  email: z.union([z.string(), z.null()]),
});

export type HttpValidationProblemDetails = z.infer<typeof HttpValidationProblemDetails>;
export const HttpValidationProblemDetails = z.intersection(
  z.object({
    type: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
    status: z.union([z.number(), z.null()]).optional(),
    detail: z.union([z.string(), z.null()]).optional(),
    instance: z.union([z.string(), z.null()]).optional(),
    errors: z.union([z.unknown(), z.null()]).optional(),
  }),
  z.object({
    string: z.any().optional(),
  }),
);

export type LoginDto = z.infer<typeof LoginDto>;
export const LoginDto = z.object({
  email: z.union([z.string(), z.null()]),
  password: z.union([z.string(), z.null()]),
  twoFactorCode: z.union([z.string(), z.null(), z.undefined()]).optional(),
  twoFactorRecoveryCode: z.union([z.string(), z.null(), z.undefined()]).optional(),
  useCookies: z.union([z.boolean(), z.null(), z.undefined()]).optional(),
  rememberMe: z.union([z.boolean(), z.null(), z.undefined()]).optional(),
});

export type ProfileOut = z.infer<typeof ProfileOut>;
export const ProfileOut = z.object({
  id: z.union([z.string(), z.undefined()]).optional(),
  login: z.union([z.string(), z.null()]),
  firstName: z.union([z.string(), z.null(), z.undefined()]).optional(),
  lastName: z.union([z.string(), z.null(), z.undefined()]).optional(),
  description: z.union([z.string(), z.null(), z.undefined()]).optional(),
  companyWebsite: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export type RefreshRequest = z.infer<typeof RefreshRequest>;
export const RefreshRequest = z.object({
  refreshToken: z.union([z.string(), z.null()]),
});

export type RegisterRequest = z.infer<typeof RegisterRequest>;
export const RegisterRequest = z.object({
  email: z.union([z.string(), z.null()]),
  password: z.union([z.string(), z.null()]),
});

export type ResendConfirmationEmailRequest = z.infer<typeof ResendConfirmationEmailRequest>;
export const ResendConfirmationEmailRequest = z.object({
  email: z.union([z.string(), z.null()]),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;
export const ResetPasswordRequest = z.object({
  email: z.union([z.string(), z.null()]),
  resetCode: z.union([z.string(), z.null()]),
  newPassword: z.union([z.string(), z.null()]),
});

export type TwoFactorRequest = z.infer<typeof TwoFactorRequest>;
export const TwoFactorRequest = z.object({
  enable: z.union([z.boolean(), z.null()]).optional(),
  twoFactorCode: z.union([z.string(), z.null()]).optional(),
  resetSharedKey: z.boolean().optional(),
  resetRecoveryCodes: z.boolean().optional(),
  forgetMachine: z.boolean().optional(),
});

export type TwoFactorResponse = z.infer<typeof TwoFactorResponse>;
export const TwoFactorResponse = z.object({
  sharedKey: z.union([z.string(), z.null()]),
  recoveryCodesLeft: z.number(),
  recoveryCodes: z.union([z.array(z.string()), z.null(), z.undefined()]).optional(),
  isTwoFactorEnabled: z.boolean(),
  isMachineRemembered: z.boolean(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileDto>;
export const UpdateProfileDto = z.object({
  firstName: z.union([z.string(), z.null()]).optional(),
  lastName: z.union([z.string(), z.null()]).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  companyWebsite: z.union([z.string(), z.null()]).optional(),
});

export type post_Authlogout = typeof post_Authlogout;
export const post_Authlogout = {
  method: z.literal("POST"),
  path: z.literal("/auth/logout"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  response: z.unknown(),
};

export type post_Authregister = typeof post_Authregister;
export const post_Authregister = {
  method: z.literal("POST"),
  path: z.literal("/auth/register"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: RegisterRequest,
  }),
  response: z.unknown(),
};

export type post_Authlogin = typeof post_Authlogin;
export const post_Authlogin = {
  method: z.literal("POST"),
  path: z.literal("/auth/login"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: LoginDto,
  }),
  response: AccessTokenResponse,
};

export type post_Refresh = typeof post_Refresh;
export const post_Refresh = {
  method: z.literal("POST"),
  path: z.literal("/refresh"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: RefreshRequest,
  }),
  response: AccessTokenResponse,
};

export type post_ResendConfirmationEmail = typeof post_ResendConfirmationEmail;
export const post_ResendConfirmationEmail = {
  method: z.literal("POST"),
  path: z.literal("/resendConfirmationEmail"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: ResendConfirmationEmailRequest,
  }),
  response: z.unknown(),
};

export type post_ForgotPassword = typeof post_ForgotPassword;
export const post_ForgotPassword = {
  method: z.literal("POST"),
  path: z.literal("/forgotPassword"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: ForgotPasswordRequest,
  }),
  response: z.unknown(),
};

export type post_ResetPassword = typeof post_ResetPassword;
export const post_ResetPassword = {
  method: z.literal("POST"),
  path: z.literal("/resetPassword"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: ResetPasswordRequest,
  }),
  response: z.unknown(),
};

export type post_Manage2fa = typeof post_Manage2fa;
export const post_Manage2fa = {
  method: z.literal("POST"),
  path: z.literal("/manage/2fa"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: TwoFactorRequest,
  }),
  response: TwoFactorResponse,
};

export type get_Manageinfo = typeof get_Manageinfo;
export const get_Manageinfo = {
  method: z.literal("GET"),
  path: z.literal("/manage/info"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  response: z.unknown(),
};

export type get_Manageprofile = typeof get_Manageprofile;
export const get_Manageprofile = {
  method: z.literal("GET"),
  path: z.literal("/manage/profile"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  response: ProfileOut,
};

export type patch_Manageprofile = typeof patch_Manageprofile;
export const patch_Manageprofile = {
  method: z.literal("PATCH"),
  path: z.literal("/manage/profile"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: UpdateProfileDto,
  }),
  response: z.unknown(),
};

export type get_Manageprofiles = typeof get_Manageprofiles;
export const get_Manageprofiles = {
  method: z.literal("GET"),
  path: z.literal("/manage/profiles"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: z.array(z.string()),
  }),
  response: z.array(ProfileOut),
};

// <EndpointByMethod>
export const EndpointByMethod = {
  post: {
    "/auth/logout": post_Authlogout,
    "/auth/register": post_Authregister,
    "/auth/login": post_Authlogin,
    "/refresh": post_Refresh,
    "/resendConfirmationEmail": post_ResendConfirmationEmail,
    "/forgotPassword": post_ForgotPassword,
    "/resetPassword": post_ResetPassword,
    "/manage/2fa": post_Manage2fa,
  },
  get: {
    "/confirmEmail": get_MapIdentityApi__ / confirmEmail,
    "/manage/info": get_Manageinfo,
    "/manage/profile": get_Manageprofile,
    "/manage/profiles": get_Manageprofiles,
  },
  patch: {
    "/manage/profile": patch_Manageprofile,
  },
};
export type EndpointByMethod = typeof EndpointByMethod;
// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type PostEndpoints = EndpointByMethod["post"];
export type GetEndpoints = EndpointByMethod["get"];
export type PatchEndpoints = EndpointByMethod["patch"];
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

  // <ApiClient.get>
  get<Path extends keyof GetEndpoints, TEndpoint extends GetEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<z.infer<TEndpoint["parameters"]>>
  ): Promise<z.infer<TEndpoint["response"]>> {
    return this.fetcher("get", this.baseUrl + path, params[0]) as Promise<z.infer<TEndpoint["response"]>>;
  }
  // </ApiClient.get>

  // <ApiClient.patch>
  patch<Path extends keyof PatchEndpoints, TEndpoint extends PatchEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<z.infer<TEndpoint["parameters"]>>
  ): Promise<z.infer<TEndpoint["response"]>> {
    return this.fetcher("patch", this.baseUrl + path, params[0]) as Promise<z.infer<TEndpoint["response"]>>;
  }
  // </ApiClient.patch>
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
