import * as BUI from "@thatopen/ui";

export const viewport = BUI.Component.create<BUI.Viewport>(() => {
	return BUI.html`
            <bim-viewport>
              <bim-grid floating></bim-grid>
            </bim-viewport>
        `;
});
