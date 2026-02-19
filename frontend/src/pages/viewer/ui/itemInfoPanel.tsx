import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import type { Components } from "@thatopen/components";
import type { Highlighter } from "@thatopen/components-front";
import { createRoot } from "react-dom/client";
import { SpecificationApp } from "./SpecificationApp";
import { updateTableData } from "../model";

export const itemInfoPanelUi = (
	components: Components,
	highlighter: Highlighter,
) => {
	const [itemsTable, updateItemsTable] = CUI.tables.itemsData({
		components,
		modelIdMap: {},
	});

	// Рекурсивно обходим данные таблицы и извлекаем плоский список
	// { elementId, elementName, attrName, attrValue }
	const extractRows = (data: any[]): any[] => {
		const rows: any[] = [];
		for (const group of data) {
			const elementName = group.data?.Name ?? "";
			const elementId = String(group.data?.localId ?? group.data?.modelId ?? Math.random());
			// Рекурсивно обходим children — наборы свойств
			if (group.children) {
				for (const pset of group.children) {
					if (pset.children) {
						// Атрибуты набора свойств
						for (const attr of pset.children) {
							const name = attr.data?.Name ?? "";
							const value = attr.data?.Value ?? "";
							if (name && value !== "") {
								rows.push({ elementId, elementName, attrName: name, attrValue: String(value) });
							}
						}
					} else {
						// Прямые атрибуты без набора свойств
						const name = pset.data?.Name ?? "";
						const value = pset.data?.Value ?? "";
						if (name && value !== "") {
							rows.push({ elementId, elementName, attrName: name, attrValue: String(value) });
						}
					}
				}
			}
		}
		return rows;
	};

	highlighter.events.select.onHighlight.add((modelIdMap) => {
		updateItemsTable({ modelIdMap });
		// Ждём пока таблица загрузит данные, затем передаём их
		setTimeout(() => {
			const rows = extractRows((itemsTable as any).data ?? []);
			updateTableData(rows);
		}, 1500);
	});

	highlighter.events.select.onClear.add(() => {
		updateItemsTable({ modelIdMap: {} });
		updateTableData([]);
	});

	const onSearchInput = (e: Event) => {
		const input = e.target as BUI.TextInput;
		itemsTable.queryString = input.value;
	};

	const onExportJSON = () => {
		itemsTable.downloadData("entities-attributes");
	};

	const onCopyTSV = async () => {
		const tsv = itemsTable.tsv ?? "";
		await navigator.clipboard.writeText(tsv);
	};

	const panel = BUI.Component.create(() => {
		return BUI.html`
			<bim-tabs>
				<bim-tab name="Tree" label="Tree" icon="ph:tree">
					<bim-panel-section label="Entity Attributes">
						<div style="display: flex; gap: 0.5rem; justify-content: space-between;">
							<div style="display: flex; gap: 0.5rem;">
								<bim-text-input @input=${onSearchInput} type="search" placeholder="Search" debounce="250"></bim-text-input>
							</div>
							<div style="display: flex; gap: 0.5rem;">
								<bim-button @click=${onCopyTSV} icon="solar:copy-bold" tooltip-title="Copy TSV" tooltip-text="Copy the table contents as tab separated text values."></bim-button>
								<bim-button @click=${onExportJSON} icon="ph:export-fill" tooltip-title="Export JSON" tooltip-text="Download the table contents as a JSON file."></bim-button>
							</div>
						</div>
						${itemsTable}
					</bim-panel-section>
				</bim-tab>
				<bim-tab name="Specification" label="Specification" icon="ph:table">
					<bim-panel-section label="Specification">
						<div id="react-spec" style="height: 100%;"></div>
					</bim-panel-section>
				</bim-tab>
			</bim-tabs>
		`;
	});

	// Монтируем React один раз после того как DOM готов
	let specReactMounted = false;
	const mountInterval = setInterval(() => {
		const container = document.getElementById("react-spec");
		if (container) {
			clearInterval(mountInterval);
			if (!specReactMounted) {
				specReactMounted = true;
				const root = createRoot(container);
				root.render(<SpecificationApp />);
			}
		}
	}, 100);

	return panel;
};
