import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as CUI from "@thatopen/ui-obc";
import * as FRAGS from "@thatopen/fragments";
import groupings from "./Sections/Groupings.ts";
import { Models } from "~/shared/lib/untils.ts";

export default (components: OBC.Components) => {
	const [modelsList] = CUI.tables.modelsList({ components });

	const fragments = components.get(OBC.FragmentsManager);
	const highlighter = components.get(OBF.Highlighter);

	// spatialTree с autoUpdate=true сам отслеживает изменения моделей
	const [spatialTree, updateSpatialTree] = CUI.tables.spatialTree(
		{
			components,
			models: Models,
			selectHighlighterName: "select",
		},
		true,
	);

	spatialTree.preserveStructureOnFilter = true;

	// Обновляем дерево при загрузке каждой модели
	fragments.onFragmentsLoaded.add(() => {
		updateSpatialTree({ models: [...Models] as Iterable<FRAGS.FragmentsModel> });
	});

	// Обновляем дерево при удалении модели
	fragments.list.onItemDeleted.add(() => {
		updateSpatialTree({ models: [...Models] as Iterable<FRAGS.FragmentsModel> });
	});

	// Двойной клик по модели в списке — выделяем все её элементы
	modelsList.addEventListener("rowcreated", ({ detail }: any) => {
		const { row } = detail;
		const modelId: string | undefined = row.data?.modelId ?? row.data?.ModelId;
		if (!modelId) return;

		row.addEventListener("dblclick", async (e: MouseEvent) => {
			e.stopPropagation();
			const model = fragments.list.get(modelId);
			if (!model) return;
			const localIds = await model.getLocalIds();
			const modelIdMap: Record<string, Set<number>> = {
				[modelId]: new Set(localIds),
			};
			await highlighter.highlightByID("select", modelIdMap, true);
		});
	});

	const search = (e: Event) => {
		const input = e.target as BUI.TextInput;
		spatialTree.queryString = input.value;
	};

	return BUI.Component.create<BUI.Panel>(() => {
		return BUI.html`
      <bim-panel>
        <bim-panel-section label="Loaded Models" icon="mage:box-3d-fill">
          ${modelsList}
        </bim-panel-section>
        <bim-panel-section label="Spatial Structures" icon="ph:tree-structure-fill">
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${search} vertical placeholder="Search..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${() => (spatialTree.expanded = !spatialTree.expanded)} icon="eva:expand-fill"></bim-button>
          </div>
          ${spatialTree}
        </bim-panel-section>
        ${groupings(components)}
      </bim-panel>
    `;
	});
};
