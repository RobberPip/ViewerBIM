import type { Mutation } from "@farfetched/core";
import {
	Field,
	FormApi,
	type FormOptions as BaseFormOptions,
	type FormState,
	functionalUpdate,
	type ReactFormExtendedApi,
	useStore,
	type Validator,
	type ValidationError,
} from "@tanstack/react-form";
import {
	attach,
	createEffect,
	createEvent,
	createStore,
	type Event,
	type EventPayload,
	is,
	sample,
	type Store,
	type StoreWritable,
} from "effector";
import type { PropsWithChildren } from "react";

export type FormOptions<
	TFormData,
	TFormValidator extends Validator<TFormData, unknown> | undefined = undefined,
> = Omit<BaseFormOptions<TFormData, TFormValidator>, "onSubmit"> & {
	defaultValues?:
		| BaseFormOptions<TFormData, TFormValidator>["defaultValues"]
		| Store<
				Required<BaseFormOptions<TFormData, TFormValidator>>["defaultValues"]
		  >;
};

export type FormInstance<
	TFormData,
	TFormValidator extends Validator<TFormData, unknown> | undefined = undefined,
> = {
	$form: StoreWritable<FormApi<TFormData, TFormValidator>>;
	onSubmit: Event<{
		value: TFormData;
		formApi: FormApi<TFormData, TFormValidator>;
	}>;
};

export function createForm<
	TFormData,
	TFormValidator extends Validator<TFormData, unknown> | undefined = undefined,
>(opts?: FormOptions<TFormData, TFormValidator>) {
	const onSubmit =
		createEvent<
			Parameters<
				Required<BaseFormOptions<TFormData, TFormValidator>>["onSubmit"]
			>[0]
		>();
	const api = new FormApi<TFormData, TFormValidator>({
		...opts,
		defaultValues: is.store(opts?.defaultValues)
			? undefined
			: opts?.defaultValues,
		onSubmit,
	});

	const extendedApi: ReactFormExtendedApi<TFormData, TFormValidator> =
		api as never;

	extendedApi.Field = function APIField(props) {
		return <Field {...props} form={api} />;
	};
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	extendedApi.Subscribe = (props: any) => {
		// biome-ignore lint/correctness/noChildrenProp: <explanation>
		return (
			<LocalSubscribe
				form={api}
				selector={props.selector}
				// biome-ignore lint/correctness/noChildrenProp: <explanation>
				children={props.children}
			/>
		);
	};

	const updateValues = createEvent<TFormData>();
	const $values = createStore(opts?.defaultState?.values, {
		skipVoid: false,
	}).on(updateValues, (_, values) => {
		return values;
	});

	const updateErrors = createEvent<ValidationError[] | null>();
	const $errors = createStore<ValidationError[] | null>(null).on(
		updateErrors,
		(_, errors) => {
			return errors;
		},
	);

	if (is.store(opts?.defaultValues)) {
		sample({
			source: opts.defaultValues as Store<TFormData>,
			target: createEffect((defaultValues: TFormData) => {
				api.update({ ...api.options, defaultValues });
			}),
		});
		sample({
			source: opts.defaultValues as Store<TFormData>,
			target: $values,
		});
	} else {
		if (opts?.defaultValues != null) {
			updateValues(opts?.defaultValues);
		}
	}

	api.store.subscribe((state) => {
		if (state.currentVal.errors.length > 0) {
			updateErrors(state.currentVal.errors);
		}
		updateErrors(null);
		updateValues(state.currentVal.values);
	});

	const $extendedForm = createStore(extendedApi);
	const $form = createStore(api);

	return {
		$form,
		$extendedForm,
		$values,
		$errors,
		onSubmit,
		"@@unitShape": () => ({
			extendedForm: $extendedForm,
			form: $form,
		}),
	};
}

function LocalSubscribe({
	form,
	selector,
	children,
}: PropsWithChildren<{
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: FormApi<any, any>;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	selector: (state: FormState<any>) => FormState<any>;
}>) {
	const data = useStore(form.store, selector);

	return functionalUpdate(children, data);
}

export function submit<Params, Data, Error>(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	mutation: Mutation<any, Data, Error>,
	args: {
		on: FormInstance<Params>;
		fn?: (args: {
			value: Params;
			formApi: FormApi<Params, undefined>;
		}) => Params;
	},
) {
	sample({
		clock: args.on.onSubmit,
		fn: (params) => {
			return args.fn?.(params) ?? params.value;
		},
		target: mutation.start,
	});
}

export function updateErrors<Params, Data, Error>(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: FormInstance<any>,
	args: {
		on: Mutation<Params, Data, Error>;
		fn: (
			mutation: EventPayload<
				Mutation<Params, Data, Error>["finished"]["failure"]
			>,
		) => {
			errors: Record<string, string[]>;
		};
	},
) {
	const setErrorsFx = attach({
		source: form.$form,
		effect: (form, { errors }: { errors: Record<string, string[]> }) => {
			for (const [name, errorList] of Object.entries(errors)) {
				form
					.getFieldInfo(name)
					?.instance?.setErrorMap({ onServer: errorList.join("\n") });
			}
		},
	});

	sample({
		clock: args.on.finished.failure,
		fn: args.fn,
		target: setErrorsFx,
	});
}
