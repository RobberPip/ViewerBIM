import { createMutation, createQuery } from "@farfetched/core";
import { sample } from "effector";
import { z } from "zod";
import { createAuthApiEffectWithContract } from "~/shared/api/clinet";
import type { components } from "~/shared/api/schema-auth";
import { applyAuthBarrier, chainAuthorized } from "~/shared/auth";
import { createForm, submit, updateErrors } from "~/shared/lib/form";
import { mapValidationErrorToForm } from "~/shared/lib/form-helpers";
import { routes } from "~/shared/routing";

export const profileRoute = chainAuthorized(routes.profile);

type ProfileIn = components["schemas"]["UpdateProfileDto"];

export const profileQuery = createQuery({
	...createAuthApiEffectWithContract("get", "/manage/profile"),
	mapData: (data) => data.result,
	initialData: {
		login: "",
		firstName: "",
		lastName: "",
		description: "",
		companyWebsite: "",
	},
});
applyAuthBarrier(profileQuery);

export const updateProfileMutation = createMutation({
	...createAuthApiEffectWithContract("patch", "/manage/profile", {
		mapParams: (args: ProfileIn) => {
			return { body: args };
		},
	}),
});
applyAuthBarrier(updateProfileMutation);

sample({
	clock: [profileRoute.updated, profileRoute.opened],
	target: profileQuery.start,
});

const ProfileIn = z.object({
	firstName: z.string(),
	lastName: z.string(),
	description: z.string(),
	companyWebsite: z.string(),
});
export const updateProfileForm = createForm<Partial<ProfileIn>>({
	defaultValues: profileQuery.$data.map((p) => ({
		firstName: p.firstName ?? "",
		lastName: p.lastName ?? "",
		description: p.description ?? "",
		companyWebsite: p.companyWebsite ?? "",
	})),
	validators: {
		onChange: ProfileIn,
	},
});
submit(updateProfileMutation, {
	on: updateProfileForm,
});
updateErrors(updateProfileForm, {
	on: updateProfileMutation,
	fn: mapValidationErrorToForm,
});
