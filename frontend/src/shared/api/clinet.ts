import createFetchClient from "openapi-fetch";
import { createClient } from "openapi-ff";
import type { paths as AuthPaths } from "./schema-auth";
import type { paths as ProjectsPaths } from "./schema-projects";
import type { paths as AiPaths } from "./schema-ai";

// Создание клиентов
export const clientAuth = createFetchClient<AuthPaths>({});
export const clientProjects = createFetchClient<ProjectsPaths>({});
export const clientAi = createFetchClient<AiPaths>({});

// Функция для создания контракта
export const createContract = (method: string, path: string) => ({
	isData(d: unknown): d is unknown {
		return true; // Здесь можно добавить валидацию
	},
	getErrorMessages: () => [], // Здесь можно обработать ошибки
});

// Создание API-клиентов
export const authApi = createClient(clientAuth, { createContract });
export const projectsApi = createClient(clientProjects, { createContract });
export const aiApi = createClient(clientAi, { createContract });

// Экспорт функции для создания API-эффектов с контрактами
export const {
	createApiEffectWithContract: createAuthApiEffectWithContract,
	createApiEffect: createAuthApiEffect,
} = authApi;

export const {
	createApiEffectWithContract: createProjectsApiEffectWithContract,
	createApiEffect: createProjectsApiEffect,
} = projectsApi;

export const {
	createApiEffectWithContract: createAiApiEffectWithContract,
	createApiEffect: createAiApiEffect,
} = aiApi;
