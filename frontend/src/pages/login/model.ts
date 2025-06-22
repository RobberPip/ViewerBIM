import { z } from "zod";
import { routes } from "~/shared/routing";
import { createForm, submit } from "~/shared/lib/form";
import type { components } from "~/shared/api/schema-auth";
import {
	authorized,
	logout,
	signInMutation,
	signUpMutation,
} from "~/shared/auth";
import { sample } from "effector";
import { createMutation } from "@farfetched/core";
import { createAuthApiEffect } from "~/shared/api/clinet";

export const loginRoute = routes.auth.signIn;
export const signupRoute = routes.auth.signUp;

type LoginDto = components["schemas"]["LoginDto"];
type SignUpDto = components["schemas"]["RegisterRequest"];

const LoginDto = z.object({
	email: z.string().email("Введите корректную почту"),
	password: z.string().nonempty(),
	rememberMe: z.boolean(),
});
export const loginForm = createForm({
	defaultValues: {
		email: "",
		password: "",
		rememberMe: false,
	},
	validators: {
		onSubmit: LoginDto,
		onBlur: LoginDto,
	},
});
submit(signInMutation, {
	on: loginForm,
});

sample({
	clock: authorized,
	filter: loginRoute.$isOpened,
	target: routes.profile.open,
});
sample({
	clock: logout,
	target: loginRoute.open,
});
const SignUpDto = z.object({
	email: z.string().email("Введите корректную почту"),
	password: z.string().nonempty(),
});
export const signUpForm = createForm({
	defaultValues: {
		email: "",
		password: "",
		rememberMe: false,
	},
	validators: {
		onSubmit: SignUpDto,
		onBlur: SignUpDto,
	},
});
submit(signUpMutation, {
	on: signUpForm,
});

sample({
	clock: authorized,
	filter: () =>
		loginRoute.$isOpened.getState() || signupRoute.$isOpened.getState(),
	target: routes.profile.open,
});
