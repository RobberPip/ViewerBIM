import { createRoot } from "react-dom/client";
import { useState } from "react";
import { ModalIssue } from "./ModalIssue";
import type * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { AppManager } from "~/widgets/bim-components";
import React from "react";

export default (components: OBC.Components) => {
  let rootModal: ReturnType<typeof createRoot> | null = null;

  requestAnimationFrame(() => {
    const container = document.getElementById("react-add-issues");
    if (container && !rootModal) {
      rootModal = createRoot(container);
      const ModalWrapper = () => {
        const [open, setOpen] = useState(false);

        // сохраняем колбэк чтобы можно было вызывать его снаружи
        (window as any).openIssueModal = () => setOpen(true);

        return (
          <ModalIssue
            open={open}
            onClose={() => setOpen(false)}
          />
        );
      };

      rootModal.render(<ModalWrapper />);
    }
  });

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section 
        label="InfoProject" 
        icon="ph:cursor-fill" 
      >
        <bim-button 
          @click=${() => (window as any).openIssueModal()} 
          icon="tabler:lock-filled" 
          label="Add Issue"
        ></bim-button>

        <div id="react-add-issues"></div>

        <bim-button 
          @click=${() => {
            const appManager = components.get(AppManager);
            const viewportGrid = appManager.grids.get("viewport");
            if (viewportGrid) {
              viewportGrid.layout =
                viewportGrid.layout === "second" ? "main" : "second";
            }
          }} 
          icon="fe:tiled" 
          label="Attributes info" 
          tooltip-title="Load BIM Tiles"
        ></bim-button>
      </bim-toolbar-section>
    `;
  });
};
