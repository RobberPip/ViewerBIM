import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as CUI from "@thatopen/ui-obc";
import { AppManager } from "../../bim-components";

export default (components: OBC.Components) => {
	const highlighter = components.get(OBF.Highlighter);
	const appManager = components.get(AppManager);
	const viewportGrid = appManager.grids.get("viewport");

	const [itemsTable, updateItemsTable] = CUI.tables.itemsData({
		components,
		modelIdMap: {},
	});

	highlighter.events.select.onHighlight.add((modelIdMap) => {
		if (!viewportGrid) return;
		updateItemsTable({ modelIdMap });
	});

	highlighter.events.select.onClear.add(() => {
		updateItemsTable({ modelIdMap: {} });
		if (!viewportGrid) return;
		(viewportGrid as any).layout = "main";
	});

	return BUI.Component.create<BUI.Panel>(() => {
		return BUI.html`
      <bim-panel>
        <bim-panel-section name="selection" label="Selection Information" icon="solar:document-bold" fixed>
          ${itemsTable}
        </bim-panel-section>
      </bim-panel>
    `;
	});
};
