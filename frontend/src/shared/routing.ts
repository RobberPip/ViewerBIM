import {
	createHistoryRouter,
	createRoute,
	createRouterControls,
} from "atomic-router";
import { createBrowserHistory } from "history";
import { sample } from "effector";
import { appStarted } from "./config";

export const routes = {
	auth: {
		signIn: createRoute(),
		signUp: createRoute(),
	},
	home: createRoute(),
	viewer: createRoute<{ items: string[]; projectId: string }>(),
	profile: createRoute(),
	projects: createRoute(),
	projectsNew: createRoute(),
	projectsForm: createRoute<{ projectId: string }>(),
	error: createRoute(),
};

export const routesMap = [
	{ path: "/", route: routes.home },
	{ path: "/login", route: routes.auth.signIn },
	{ path: "/signup", route: routes.auth.signUp },
	{ path: "/viewer", route: routes.viewer },
	{ path: "/profile", route: routes.profile },
	{ path: "/projects", route: routes.projects },
	{ path: "/projects/new", route: routes.projectsNew },
	{ path: "/projects/:projectId", route: routes.projectsForm },
];
export const controls = createRouterControls();

export const router = createHistoryRouter({
	routes: routesMap,
	controls,
	notFoundRoute: routes.error,
});

sample({
	clock: appStarted,
	fn: () => createBrowserHistory(),
	target: router.setHistory,
});
