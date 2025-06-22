import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import * as WEBIFC from "web-ifc";
import type { Components } from "@thatopen/components";
import type { Highlighter } from "@thatopen/components-front";
import { createRoot } from "react-dom/client";
import { SpecificationApp } from "./SpecificationApp";
import { updateTable } from "../model";

export const itemInfoPanelUi = (
	components: Components,
	highlighter: Highlighter,
) => {
	const baseStyle: Record<string, string> = {
		padding: "0.25rem",
		borderRadius: "0.25rem",
	};

	const tableDefinition: BUI.TableDataTransform = {
		Entity: (entity) => {
			let style = {};
			if (entity === OBC.IfcCategoryMap[WEBIFC.IFCPROPERTYSET]) {
				style = {
					...baseStyle,
					backgroundColor: "purple",
					color: "white",
				};
			}
			if (String(entity).includes("IFCWALL")) {
				style = {
					...baseStyle,
					backgroundColor: "green",
					color: "white",
				};
			}
			return BUI.html`<bim-label style=${BUI.styleMap(style)}>${entity}</bim-label>`;
		},
		PredefinedType: (type) => {
			const colors = ["#1c8d83", "#3c1c8d", "#386c19", "#837c24"];
			const randomIndex = Math.floor(Math.random() * colors.length);
			const backgroundColor = colors[randomIndex];
			const style = { ...baseStyle, backgroundColor, color: "white" };
			return BUI.html`<bim-label style=${BUI.styleMap(style)}>${type}</bim-label>`;
		},
		NominalValue: (value) => {
			let style = {};
			if (typeof value === "boolean" && value === false) {
				style = {
					...baseStyle,
					backgroundColor: "#b13535",
					color: "white",
				};
			}
			if (typeof value === "boolean" && value === true) {
				style = {
					...baseStyle,
					backgroundColor: "#18882c",
					color: "white",
				};
			}
			return BUI.html`<bim-label style=${BUI.styleMap(style)}>${value}</bim-label>`;
		},
	};

	const [attributesTable, updateAttributesTable] = CUI.tables.entityAttributes({
		components,
		fragmentIdMap: {},
		tableDefinition,
		attributesToInclude: () => {
			const attributes: Array<string | ((name: string) => boolean)> = [
				"Name",
				"ContainedInStructure",
				"HasProperties",
				"HasPropertySets",
				(name: string) => name.includes("Value"),
				(name: string) => name.startsWith("Material"),
				(name: string) => name.startsWith("Relating"),
				(name: string) => {
					const ignore = ["IsGroupedBy", "IsDecomposedBy"];
					return name.startsWith("Is") && !ignore.includes(name);
				},
			];
			return attributes;
		},
	});

	highlighter.events.select.onHighlight.add((fragmentIdMap) => {
		updateAttributesTable({ fragmentIdMap });
		setTimeout(() => {
			updateTable(attributesTable.tsv);
		}, 500);
	});

	highlighter.events.select.onClear.add(() => {
		updateAttributesTable({ fragmentIdMap: {} });
		setTimeout(() => {
			updateTable("");
		}, 500);
	});

	attributesTable.expanded = false;
	attributesTable.indentationInText = true;
	attributesTable.preserveStructureOnFilter = true;

	const onSearchInput = (e: Event) => {
		const input = e.target as BUI.TextInput;
		attributesTable.queryString = input.value;
	};

	const onPreserveStructureChange = (e: Event) => {
		const checkbox = e.target as BUI.Checkbox;
		attributesTable.preserveStructureOnFilter = checkbox.checked;
	};

	const onExportJSON = () => {
		attributesTable.downloadData("entities-attributes");
	};
	const onCopyTSV = async () => {
		await navigator.clipboard.writeText(attributesTable.tsv); // Этот функционал переехал в SpecificationApp
		updateTable(attributesTable.tsv);
	};
	const onAttributesChange = (e: Event) => {
		const dropdown = e.target as BUI.Dropdown;
		updateAttributesTable({
			attributesToInclude: () => {
				const attributes: Array<string | ((name: string) => boolean)> = [
					...dropdown.value,
					(name: string) => name.includes("Value"),
					(name: string) => name.startsWith("Material"),
					(name: string) => name.startsWith("Relating"),
					(name: string) => {
						const ignore = ["IsGroupedBy", "IsDecomposedBy"];
						return name.startsWith("Is") && !ignore.includes(name);
					},
				];
				return attributes;
			},
		});
	};
	// Стиль перенесен в specificationStyles.ts

	return BUI.Component.create(() => {
		const html = BUI.html`
			<bim-tabs>
				<bim-tab name="Tree" label="Tree" icon="ph:tree">
					<bim-panel-section label="Entity Attributes" >
						<div style="display: flex; gap: 0.5rem; justify-content: space-between;">
							<div style="display: flex; gap: 0.5rem;">
								<bim-text-input @input=${onSearchInput} type="search" placeholder="Search" debounce="250"></bim-text-input>
							</div>
							<div style="display: flex; gap: 0.5rem;">
								<bim-dropdown @change=${onAttributesChange} multiple>
									<bim-option label="Name" checked></bim-option> 
									<bim-option label="ContainedInStructure" checked></bim-option>
									<bim-option label="ForLayerSet"></bim-option>
									<bim-option label="LayerThickness"></bim-option>
									<bim-option label="HasProperties" checked></bim-option>
									<bim-option label="HasAssociations"></bim-option>
									<bim-option label="HasAssignments"></bim-option>
									<bim-option label="HasPropertySets" checked></bim-option>
									<bim-option label="PredefinedType"></bim-option>
									<bim-option label="Quantities"></bim-option>
									<bim-option label="ReferencedSource"></bim-option>
									<bim-option label="Identification"></bim-option>
									<bim-option label="Prefix"></bim-option>
									<bim-option label="LongName"></bim-option>
								</bim-dropdown>
								<bim-button @click=${onCopyTSV} icon="solar:copy-bold" tooltip-title="Copy TSV" tooltip-text="Copy the table contents as tab separated text values, so you can copy them into a spreadsheet."></bim-button>
								<bim-button @click=${onExportJSON} icon="ph:export-fill" tooltip-title="Export JSON" tooltip-text="Download the table contents as a JSON file."></bim-button>
							</div>
						</div>
						${attributesTable}
					</bim-panel-section>
				</bim-tab>
				<bim-tab name="Specification" label="Specification" icon="ph:table">
					<bim-panel-section label="Specification" >
						<div id="react-spec"></div>
					</bim-panel-section>
				</bim-tab>
			</bim-tabs>
		`;
		function renderReactInReactss() {
			const interval = setInterval(() => {
				const container = document.getElementById("react-spec");
				if (container) {
					clearInterval(interval);
					const root = createRoot(container);
					root.render(<SpecificationApp />);
				}
			}, 50);
		}
		setTimeout(() => {
			renderReactInReactss();
		}, 0);
		return html;
	});
};
