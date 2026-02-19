import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";

interface GroupingsUIState {
	components: OBC.Components;
}

const serializeModelIdMap = (modelIdMap: OBC.ModelIdMap) => {
	const map: Record<string, number[]> = {};
	for (const modelId in modelIdMap) {
		map[modelId] = [...modelIdMap[modelId]];
	}
	return JSON.stringify(map);
};

export default (state: GroupingsUIState) => {
	const { components } = state;
	const classifier = components.get(OBC.Classifier);

	const computeTableData = (components: OBC.Components) => {
		const classifier = components.get(OBC.Classifier);
		const data: BUI.TableGroupData[] = [];
		const customSelections = classifier.list.get("CustomSelections");
		if (customSelections) {
			for (const [group, groupData] of customSelections) {
				const groupRow: BUI.TableGroupData = {
					data: {
						Name: group,
						modelIdMap: serializeModelIdMap(groupData.map),
					},
				};
				data.push(groupRow);
			}
		}
		return data;
	};

	const table = document.createElement("bim-table") as BUI.Table;
	table.headersHidden = true;
	table.hiddenColumns = ["modelIdMap"];

	table.dataTransform = {
		Name: (value) => {
			if (typeof value !== "string") return value;
			const onDeleteGroup = () => {
				const customSelections = classifier.list.get("CustomSelections");
				if (!customSelections) return;
				customSelections.delete(value);
				table.data = computeTableData(state.components);
			};

			return BUI.html`
      <div style=" display: flex; justify-content: space-between; flex: 1; align-items: center;">
        <bim-label>${value}</bim-label>
        <bim-button @click=${onDeleteGroup} style="flex: 0" icon="majesticons:delete-bin"></bim-button>
      </div>
      `;
		},
	};

	table.addEventListener("cellcreated", ({ detail }: any) => {
		const { cell } = detail;
		cell.style.padding = "0.25rem 0";
	});

	table.addEventListener("rowcreated", ({ detail }: any) => {
		const { row } = detail;
		const { modelIdMap } = row.data;
		if (typeof modelIdMap !== "string") return;
		const idMap: OBC.ModelIdMap = {};
		const parsed = JSON.parse(modelIdMap) as Record<string, number[]>;
		for (const k in parsed) {
			idMap[k] = new Set(parsed[k]);
		}
		if (Object.keys(idMap).length === 0) return;
		const highlighter = components.get(OBF.Highlighter);
		row.onmouseover = () => {
			row.style.setProperty("--bim-label--c", "var(--bim-ui_accent-base)");
			row.style.cursor = "pointer";
			highlighter.highlightByID("hover", idMap, true, false, highlighter.selection.select);
		};

		row.onmouseleave = () => {
			row.style.removeProperty("--bim-label--c");
			row.style.cursor = "default";
			highlighter.clear("hover");
		};

		row.onclick = () => {
			highlighter.highlightByID("select", idMap, true);
		};
	});

	return BUI.Component.create<BUI.Table, GroupingsUIState>(
		(state: GroupingsUIState) => {
			table.data = computeTableData(state.components);
			return BUI.html`${table}`;
		},
		state,
	);
};
