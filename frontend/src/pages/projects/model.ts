import { createQuery } from "@farfetched/core";
import { sample } from "effector";
import { createProjectsApiEffectWithContract } from "~/shared/api/clinet";
import { applyAuthBarrier, chainAuthorized } from "~/shared/auth";
import { routes } from "~/shared/routing";

export const projectsRoute = chainAuthorized(routes.projects);

export const projectsQuery = createQuery({
	...createProjectsApiEffectWithContract("get", "/api/proj/p/projects"),
	mapData: (data) => data.result,
	// initialData: {
	//   createdAt: '',
	//   updatedAt: '',
	//   avatar: {},
	//   userId: '-',
	//   userEmail: null,
	//   options: {
	//     roles: [],
	//     industries: [],
	//     companies: [],
	//   },
	//   account: {} as any, // TODO,
	// },
});
sample({
	clock: [projectsRoute.opened, projectsRoute.updated],
	target: projectsQuery.start,
});

applyAuthBarrier(projectsQuery);
