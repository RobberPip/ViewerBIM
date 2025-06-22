import type { Mutation } from "@farfetched/core";
import type { EventPayload } from "effector";
import { isApiError } from "openapi-ff";

export function mapValidationErrorToForm(
	r: EventPayload<Mutation<any, any, any>["finished"]["failure"]>,
) {
	const errors: Record<string, string[]> = {};
	if (isApiError(r)) {
		if ("errors" in r.error.response && !!r.error.response.errors) {
			const validationErrors = r.error.response.errors;
			for (const key in validationErrors) {
				const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
				errors[camelKey] = validationErrors[key];
			}
		}
	}
	return { errors };
}
