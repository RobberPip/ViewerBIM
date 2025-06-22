import { createMutation, createQuery } from "@farfetched/core";
import { startChain } from "@farfetched/atomic-router";
import { createEffect, sample } from "effector";
import { z } from "zod";
import {
	createProjectsApiEffect,
	createProjectsApiEffectWithContract,
} from "~/shared/api/clinet";
import type { components } from "~/shared/api/schema-projects";
import { applyAuthBarrier, chainAuthorized } from "~/shared/auth";
import { createForm, submit } from "~/shared/lib/form";
import { routes } from "~/shared/routing";
import { chainRoute } from "atomic-router";

export const projectQuery = createQuery({
	...createProjectsApiEffectWithContract(
		"get",
		"/api/proj/p/projects/{projectId}",
		{
			mapParams: ({ projectId }: { projectId: string }) => {
				return { params: { path: { projectId } } };
			},
			initialData: {
				id: "",
				loadKey: "",
				name: "",
				description: "",
				loaders: [],
				users: [],
				createdAt: "",
				updatedAt: "",
			},
		},
	),
	mapData: ({ result }) => result,
});

export const addUserMutation = createMutation({
	effect: createProjectsApiEffect(
		"post",
		"/api/proj/p/projects/{projectId}/invite",
		{
			mapParams: ({ projectId }: { projectId: string }) => {
				return {
					params: {
						path: { projectId },
					},
				};
			},
		},
	),
});
applyAuthBarrier(addUserMutation);
export const projectsFormRoute = chainAuthorized(
	chainRoute({
		route: routes.projectsForm,
		...startChain(projectQuery),
	}),
);

export const addIfcMutation = createMutation({
	effect: createProjectsApiEffect("post", "/api/proj/p/loaders/upload", {
		mapParams: ({
			projectId,
			files,
		}: {
			projectId?: string;
			files: File[];
		}) => {
			const formData = new FormData();

			if (projectId) {
				formData.append("projectId", projectId);
			}

			for (const file of files) {
				formData.append("ifcFiles", file);
			}

			return {
				body: formData as unknown as components["schemas"]["LoaderIn"],
			};
		},
	}),
});

applyAuthBarrier(addUserMutation);

sample({
	clock: addUserMutation.finished.success,
	fn: ({ result }) => result ?? "",
	filter: (text) => Boolean(text),
	target: createEffect<string, void>(async (text) => {
		await navigator.clipboard.writeText(text);
	}),
});
sample({
	clock: addIfcMutation.finished.success,
	source: projectQuery.$data,
	fn: (data) => ({ projectId: data?.id ?? "" }),
	target: projectQuery.start,
});
