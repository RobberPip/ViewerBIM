import { AccountCircle, Home, WorkOutline } from "@mui/icons-material";
import type { RouteInstance } from "atomic-router";
import { createEffect, createEvent, createStore, sample } from "effector";
import { routes } from "~/shared/routing";

export const navigate = createEvent<string>();

export interface MenuItem {
	id: string;
	text: string;
	icon: React.ElementType;
	route: RouteInstance<object>;
}

const menuItems: MenuItem[] = [
	{
		id: "home",
		text: "Главная",
		icon: Home,
		route: routes.home,
	},
	{
		id: "profile",
		text: "Профиль",
		icon: AccountCircle,
		route: routes.profile,
	},
	{
		id: "projects",
		text: "Проекты",
		icon: WorkOutline,
		route: routes.projects,
	},
];

export const $menuItems = createStore(menuItems);
export const resetActiveItem = createEvent();

// Состояние активного элемента
export const $activeItem = createStore<MenuItem | null>(null).on(
	resetActiveItem,
	() => null,
);

sample({
	clock: navigate,
	fn: (id) => {
		const activeId = menuItems.find((item) => item.id === id) || null;
		return activeId;
	},
	target: $activeItem,
});

sample({
	clock: $activeItem,
	fn: (item) => {
		return item;
	},
	target: createEffect((item: any) => {
		item.route.open({});
	}),
});
