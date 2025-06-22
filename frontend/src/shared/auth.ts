import {
	applyBarrier,
	createBarrier,
	createMutation,
	createQuery,
} from "@farfetched/core";
import {
	type RouteInstance,
	type RouteParams,
	type RouteParamsAndQuery,
	chainRoute,
} from "atomic-router";
import { combine, createEvent, createStore, sample } from "effector";
import { debug, not } from "patronum";
import { createAuthApiEffect } from "./api/clinet";
import type { components } from "./api/schema-auth";
import { router, routes } from "./routing";

export const viewerQuery = createQuery({
	effect: createAuthApiEffect("get", "/manage/info", {
		mapParams: () => ({
			headers: {
				"Cache-Control": "no-cache",
			},
		}),
	}),
});

export const checkViewerQuery = createQuery({
	effect: createAuthApiEffect("get", "/manage/info"),
});

export const signInMutation = createMutation({
	effect: createAuthApiEffect("post", "/auth/login", {
		mapParams: (args: components["schemas"]["LoginDto"]) => {
			return {
				body: {
					...args,
					useCookies: true,
				},
			};
		},
	}),
});
export const signUpMutation = createMutation({
	effect: createAuthApiEffect("post", "/auth/register", {
		mapParams: (args: components["schemas"]["RegisterRequest"]) => {
			return { body: args };
		},
	}),
});
sample({
	clock: [signUpMutation.finished.success, signInMutation.finished.success],
	target: viewerQuery.start,
});
export const logout = createEvent();

export const authorized = createEvent();

export const unauthorized = createEvent();

export const $viewer = combine(
	[viewerQuery.$data, checkViewerQuery.$data],
	([v1, v2]) => v1 ?? v2,
);

export const $authorized = createStore(false);

export const $next = createStore("/softwares");
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const $nextRoute = createStore<null | RouteInstance<{}>>(null);

$authorized.on(authorized, () => true).on(unauthorized, () => false);
debug($authorized);
// login
// biome-ignore lint/complexity/noUselessLoneBlockStatements: <explanation>
{
	sample({
		clock: [checkViewerQuery.finished.failure, signInMutation.finished.failure],
		filter: ({ error }) => {
			if ("status" in error) {
				return error.status === 401;
			}
			return false;
		},
		target: unauthorized,
	});

	sample({
		clock: unauthorized,
		source: router.$path,
		filter: not(routes.auth.signIn.$isOpened),
		target: $next,
	});
	sample({
		clock: unauthorized,
		target: routes.auth.signIn.open,
	});

	sample({
		clock: [
			viewerQuery.finished.success,
			checkViewerQuery.finished.success,
			signInMutation.finished.success,
			signUpMutation.finished.success,
		],
		target: authorized,
	});
}
// Logout
sample({
	clock: logout,
	target: createAuthApiEffect("post", "/auth/logout"),
});
$next.reset(logout);
$authorized.reset(logout);

export function chainAuthorized<Params extends RouteParams>(
	route: RouteInstance<Params>,
) {
	const sessionCheckStarted = createEvent<RouteParamsAndQuery<Params>>();

	const alreadyAuthorized = sample({
		clock: sessionCheckStarted,
		filter: $authorized,
		fn: () => {
			console.log("User is already authorized.");
		},
		target: authorized,
	});

	sample({
		clock: sessionCheckStarted,
		filter: not($authorized),
		fn: () => {},
		target: checkViewerQuery.start,
	});

	return chainRoute({
		route,
		beforeOpen: sessionCheckStarted,
		openOn: [alreadyAuthorized, authorized],
	});
}

const authBarrier = createBarrier({
	active: not($authorized),
});

export function withViewer<Params extends RouteParams>(
	route: RouteInstance<Params>,
) {
	sample({
		clock: route.opened,
		filter: not($authorized),
		fn: () => ({}),
		target: viewerQuery.start,
	});
	return route;
}

type RemoteOperation = Parameters<typeof applyBarrier>[0][0];

export function applyAuthBarrier(
	operation: RemoteOperation | RemoteOperation[],
) {
	const operations = Array.isArray(operation) ? operation : [operation];
	for (const operation of operations) {
		sample({
			clock: operation.finished.failure,
			filter: ({ error }) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				return (error as any)?.status === 401;
			},
			target: unauthorized,
		});
	}

	applyBarrier(operations, { barrier: authBarrier });
}
