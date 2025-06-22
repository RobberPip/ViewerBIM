import { createMutation, createQuery } from "@farfetched/core";
import * as OBC from "@thatopen/components";

import { routes } from "../../shared/routing";
import {
	createEffect,
	createEvent,
	createStore,
	guard,
	sample,
} from "effector";
import { applyAuthBarrier, chainAuthorized } from "~/shared/auth";
import {
	createAiApiEffect,
	createProjectsApiEffect,
	createProjectsApiEffectWithContract,
} from "~/shared/api/clinet";
import type { components as ProjectComponents } from "~/shared/api/schema-projects";
import {
	highlighter,
	Models,
	WorldModel,
	components,
} from "~/shared/lib/untils";

import { debug } from "patronum";

export const viewerRoute = chainAuthorized(routes.viewer);

export const aiChatMutation = createMutation({
	effect: createAiApiEffect("post", "/ai/chat", {
		mapParams: (args: any) => ({ body: args }),
	}),
});
applyAuthBarrier(aiChatMutation);

export const addIssueMutation = createMutation({
  effect: createProjectsApiEffect("post", "/api/proj/p/issues/add", {
    mapParams: (args: { projectId: string; file: File ,title: string }) => {
      const formData = new FormData();
      formData.append("projectId", args.projectId);
      formData.append("file", args.file);
	  formData.append("title", args.title);

      return {
        body: formData as any,
      };
    },
    options: {
      skipJsonSerialization: true,
    },
  }),
});

applyAuthBarrier(addIssueMutation);


export const deleteIssueMutation = createMutation({
	effect: createProjectsApiEffect("delete", "/api/proj/p/issues/{issueId}", {
		mapParams: (args: { issueId: string }) => ({
			params: { path: { issueId: args.issueId } },
		}),
	}),
});
applyAuthBarrier(deleteIssueMutation);

// Тип Issue с камерами
// type Issue = {
// 	id: string;
// 	loaderId: string;
// 	position: string; // JSON string
// 	target: string; // JSON string
// 	createdAt: string;
// 	updatedAt: string;
// };

// type CameraType = OBC.Viewpoint;

// type IssueWithCameras = Issue & {
// 	cameras: CameraType[];
// };
export const $projectId = createStore<string>("");
sample({
	clock: routes.viewer.opened,
	source: routes.viewer.$params,
	fn: (params) => params.projectId || "",
	target: $projectId,
});
export const issuesMetaQuery = createQuery({
	...createProjectsApiEffectWithContract(
		"get",
		"/api/proj/p/issues/{projectId}",
		{
			mapParams: ({ projectId }: { projectId: string }) => ({
				params: { path: { projectId} },
			}),
		},
	),
	mapData: ({ result }) => result,
});
sample({
  clock: addIssueMutation.finished.success,
  source: $projectId,
  fn: (projectId) => ({ projectId }),
  target: issuesMetaQuery.start,
});
sample({
	clock: $projectId,
	filter: (id) => id !== "",
	fn: (projectId) => ({ projectId }),
	target: issuesMetaQuery.start,
});

export const getIssueQueryFx = createEffect(async ({ issueId }: { issueId: string }) => {
  const res = await fetch(`/api/proj/p/issues/file/${issueId}`);
  return await res.blob();
});

export const $openedIssueFile = createStore<Blob | null>(null);
debug($openedIssueFile)
export const openIssue = createEvent<{ issueId: string }>();

sample({
  clock: getIssueQueryFx.doneData,
  target: $openedIssueFile,
});

sample({
  clock: openIssue,
  fn: ({ issueId }) => ({ issueId }),
  target: getIssueQueryFx,
});

export const $urlsIFC = createStore<string[]>([]);
sample({
	clock: routes.viewer.opened,
	source: routes.viewer.$params,
	fn: (params) => params.items || [],
	target: $urlsIFC,
});
guard({
	clock: $urlsIFC.updates,
	source: $urlsIFC,
	filter: (urls) => urls.length === 0,
	target: routes.projects.open,
});


// Эффект подсветки элементов по GlobalId
const highlightEffect = createEffect<string, void>((text) => {
	const expressIds = text.split(",").map((id) => parseInt(id.trim(), 10));
	for (const model of Models) {
		const fragments = model.getFragmentMap(expressIds);
		highlighter.highlightByID("select", fragments, false, false);
	}
});

sample({
	clock: aiChatMutation.finished.success,
	fn: ({ result }) => result?.item_ids ?? "",
	filter: (text) => Boolean(text),
	target: highlightEffect,
});

sample({
	clock: deleteIssueMutation.finished.success,
	source: $projectId,
	fn: (projectId) => ({ projectId }),
	target: issuesMetaQuery.start,
});
export const updateTable = createEvent<string>();

// Создаем стор с начальными данными
export const $attributesTable = createStore<string>("").on(
	updateTable,
	(_, payload) => payload,
);

