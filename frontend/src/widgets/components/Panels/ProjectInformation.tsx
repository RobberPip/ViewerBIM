import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import groupings from "./Sections/Groupings.ts";
import * as OBF from "@thatopen/components-front";
import React from "react";
import { createRoot } from "react-dom/client";
import { Checkbox, Typography } from "@mui/material";
import { highlighter } from "~/shared/lib/untils.ts";
interface GroupItem {
	map: { [uuid: string]: Set<number> | number[] | number };
}

/**
 * Toggle visibility of a group item in fragments.
 *
 * @param groupItem - Object that contains the `map` of fragmentUUID → expressID(s)
 * @param visible - Whether to show or hide
 * @param fragmentsManager - The FragmentsManager instance
 */
export function toggleClassificationTreeVisibility(
	groupItem: GroupItem,
	visible: boolean,
	fragmentsManager: OBC.FragmentsManager,
) {
	const uuids = groupItem.map;

	for (const [uuid, elementIds] of Object.entries(uuids)) {
		const [groupEntry] = fragmentsManager.groups.entries();
		const [, fragmentsGroup2] = groupEntry;
		const { keyFragments, items } = fragmentsGroup2;

		keyFragments.forEach((keyFragment: string, index: number) => {
			if (keyFragment === uuid) {
				const fragment = items[index];

				// Normalize elementIds to an array of numbers
				const ids = normalizeElementIds(elementIds);

				// Check if any of the IDs are hidden
				const isHidden = ids.some((id) => fragment.hiddenItems.has(id));

				if (visible) {
					fragment.setVisibility(true);
				} else {
					// Use the normalized ids (which is a number[]) instead of elementIds
					fragment.setVisibility(isHidden, ids);
				}
			}
		});
	}
}

function normalizeElementIds(input: number | number[] | Set<number>): number[] {
	const seen = new Set<number>();
	const result: number[] = [];

	const add = (id: number) => {
		if (!seen.has(id)) {
			seen.add(id);
			result.push(id);
		}
	};

	if (typeof input === "number") {
		add(input);
	} else if (Array.isArray(input)) {
		for (const id of input) add(id);
	} else if (input instanceof Set) {
		for (const id of input) add(id);
	}

	return result;
}
function ClassificationTreeCustom({
	components,
	classifierData,
	fragmentsManager,
}: {
	components: OBC.Components;
	classifierData: any;
	fragmentsManager: any;
}) {
	// State for storing groupings: Entities and Predefined Types
	const [groups, setGroups] = React.useState<{ label: string; items: any[] }[]>(
		[],
	);

	// Process the classifier data when it becomes available
	React.useEffect(() => {
		if (!classifierData?.list) return;

		const entitiesRaw = classifierData.list.entities || {};
		let predefinedRaw = classifierData.list.predefinedTypes || {};
		predefinedRaw = Object.fromEntries(
			Object.entries(predefinedRaw).filter(
				([key, value]) => key !== "UNDEFINED" && key !== "NOTDEFINED",
			),
		);
		// Normalize to arrays
		const entities = Array.isArray(entitiesRaw)
			? entitiesRaw
			: Object.values(entitiesRaw);

		const predefined = Array.isArray(predefinedRaw)
			? predefinedRaw
			: Object.values(predefinedRaw);

		// Set groupings for rendering
		setGroups([
			{ label: "Entities", items: entities },
			{ label: "Predefined Types", items: predefined },
		]);
	}, [classifierData]);

	// Toggle visibility when checkbox is changed
	const handleToggle = (groupItem: any, visible: boolean) => {
		toggleClassificationTreeVisibility(groupItem, visible, fragmentsManager);
	};

	// Set up highlighting for hover interactions

	// Highlight item on hover
	const handleHover = (item: any) => {
		highlighter.highlightByID("select", item.map, true);
	};
	return (
		<div className="h-full w-full">
			<div className="text-white text-sm p-4 space-y-6">
				<h2 className="text-xl pb-2 border-b border-zinc-700">
					Classification Tree
				</h2>

				{/* Loop through and render each group */}
				{groups.map((group) => (
					<div key={group.label} className="space-y-3">
						<h3 className="uppercase text-xs text-zinc-400 tracking-wide">
							{group.label}
						</h3>

						<div className="space-y-2">
							{group.items.map((item: any, index: number) => {
								const key = item.id || item.name || `${group.label}-${index}`;
								return (
									<div
										onMouseDown={() => handleHover(item)}
										key={key}
										className="flex items-center space-x-3 px-2 py-1 rounded-md hover:bg-zinc-800 transition-colors"
									>
										{/* Checkbox to toggle visibility */}
										<Checkbox
											id={key}
											defaultChecked
											onChange={(event) =>
												handleToggle(item, event.target.checked)
											}
										/>
										{/* Label for the item */}
										<Typography className="text-zinc-100 cursor-pointer truncate">
											{item.name}
										</Typography>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
const CategoryTree = ({ components }: { components: OBC.Components }) => {
	const [classifierData, setClassifierData] = React.useState<any>(null);
	const [fragmentsManager, setFragmentsManager] = React.useState<any>(null);
	const classifier = components.get(OBC.Classifier);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		// // const components = worldManager.getComponents();
		// if (!components) return;

		const fragments = components.get(OBC.FragmentsManager);

		// Listen for fragment loading and classify
		fragments.onFragmentsLoaded.add(async (model) => {
			await classifier.byEntity(model); // Classify by Entity
			await classifier.byPredefinedType(model); // Classify by Predefined Type

			// Save references to state
			setClassifierData(classifier);
			setFragmentsManager(fragments);
		});
	}, []);

	return (
		<div className="w-full h-full">
			{/* Render only after data is available */}
			{classifierData && fragmentsManager && (
				<ClassificationTreeCustom
					components={components}
					classifierData={classifierData}
					fragmentsManager={fragmentsManager}
				/>
			)}
		</div>
	);
};
export default (components: OBC.Components) => {
	const [modelsList] = CUI.tables.modelsList({ components });
	const [relationsTree] = CUI.tables.relationsTree({
		components,
		models: [],
		hoverHighlighterName: "hover",
		selectHighlighterName: "select",
	});
	relationsTree.preserveStructureOnFilter = true;

	const search = (e: Event) => {
		const input = e.target as BUI.TextInput;
		relationsTree.queryString = input.value;
	};
	let modalRoot: ReturnType<typeof createRoot> | null = null;
	requestAnimationFrame(() => {
		const container = document.getElementById("react-categories");
		if (!container) {
			console.error("React-контейнер не найден!");
			return;
		}
		if (!modalRoot) {
			modalRoot = createRoot(container);
		}
		modalRoot.render(<CategoryTree components={components} />);
	});
	// const [classificationsTree, updateClassificationsTree] =
	// 	CUI.tables.classificationTree({
	// 		components,
	// 		classifications: [],
	// 	});
	// const classifier = components.get(OBC.Classifier);
	// const fragments = components.get(OBC.FragmentsManager);
	// fragments.onFragmentsLoaded.add(async (model) => {
	// 	// This creates a classification system named "entities"
	// 	classifier.byEntity(model);

	// 	// This creates a classification system named "predefinedTypes"
	// 	await classifier.byPredefinedType(model);
	// 	// This classifications in the state of the classifications tree.
	// 	// Is an array with the classification systems to be shown.
	// 	// You can pass the system name directly, or an object with system and label keys.
	// 	// The system key is the name in the classifier, and the label is how you want it to be shown in the table.
	// 	d = classifier.list.entities;
	// 	const classifications = [
	// 		{ system: "entities", label: "Entities" },
	// 		{ system: "predefinedTypes", label: "Predefined Types" },
	// 	];

	// 	updateClassificationsTree({ classifications });
	// });

	return BUI.Component.create<BUI.Panel>(() => {
		return BUI.html`
      <bim-panel>
        <bim-panel-section label="Loaded Models" icon="mage:box-3d-fill">
          ${modelsList}
        </bim-panel-section>
        <bim-panel-section label="Spatial Structures" icon="ph:tree-structure-fill">
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${search} vertical placeholder="Search..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${() => (relationsTree.expanded = !relationsTree.expanded)} icon="eva:expand-fill"></bim-button>
          </div>
          ${relationsTree}
        </bim-panel-section>
		<bim-panel-section collapsed label="Categories select" icon="clarity:grid-chart-line">
		<div id="react-categories"></div>
		</bim-panel-section>
        ${groupings(components)}
      </bim-panel> 
    `;
	});
};
