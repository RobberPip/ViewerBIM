import { createRoutesView } from "atomic-router-react";
import { RootPage, rootRoute } from "./root";
import { ViewerPage, viewerRoute } from "./viewer";
import { ErrorPage, errorRoute } from "./error";
import { LoginPage, loginRoute, signupRoute } from "./login";
import { ProfilePage, profileRoute } from "./profile";
import { ProfileLayout } from "../shared/ui/layout/profile";
import { ProjectsPage, projectsRoute } from "./projects";
import { ProjectsNewPage, projectsNewRoute } from "./projects-new";
import { ProjectsFormPage, projectsFormRoute } from "./projects-form";

const RoutesView = createRoutesView({
	routes: [
		{ route: rootRoute, view: RootPage },
		{ route: viewerRoute, view: ViewerPage },
		{ route: errorRoute, view: ErrorPage },
		{ route: loginRoute, view: LoginPage },
		{ route: signupRoute, view: LoginPage },
		{ route: profileRoute, view: ProfilePage, layout: ProfileLayout },
		{ route: projectsRoute, view: ProjectsPage, layout: ProfileLayout },
		{ route: projectsNewRoute, view: ProjectsNewPage, layout: ProfileLayout },
		{ route: projectsFormRoute, view: ProjectsFormPage, layout: ProfileLayout },
	],
});

export const Pages = RoutesView;
