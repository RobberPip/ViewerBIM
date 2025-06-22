import { createMutation } from "@farfetched/core";
import { sample } from "effector";
import { z } from "zod";
import { createProjectsApiEffect } from "~/shared/api/clinet";
import type { components } from "~/shared/api/schema-projects";
import { chainAuthorized } from "~/shared/auth";
import { createForm, submit } from "~/shared/lib/form";
import { routes } from "~/shared/routing";

export const projectsNewRoute = chainAuthorized(routes.projectsNew);

type ProjectsIn = components["schemas"]["ProjectsIn"];

export const addProjectMutation = createMutation({
	effect: createProjectsApiEffect("post", "/api/proj/p/projects/add", {
		mapParams: (args: components["schemas"]["ProjectsIn"]) => {
			return { body: args };
		},
	}),
});

const ProjectsIn = z.object({
	name: z.string().nonempty(),
	description: z.string(),
});
export const projectAddForm = createForm({
	defaultValues: {
		name: "",
		description: "",
	},
	validators: {
		onSubmit: ProjectsIn,
		onBlur: ProjectsIn,
	},
});
submit(addProjectMutation, {
	on: projectAddForm,
});
sample({
	clock: addProjectMutation.finished.success,
	target: routes.projects.open,
});
