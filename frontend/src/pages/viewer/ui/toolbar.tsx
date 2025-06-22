import * as BUI from "@thatopen/ui";
import camera from "../../../widgets/components/Toolbars/Sections/Camera.ts";
import custom from "../../../widgets/components/Toolbars/Sections/CustomPanels.tsx";
import measurement from "../../../widgets/components/Toolbars/Sections/Measurement.ts";
import selection from "../../../widgets/components/Toolbars/Sections/Selection.ts";
import load from "../../../widgets/components/Toolbars/Sections/Import.ts";
import type { Components, World } from "@thatopen/components";
import { AppManager } from "~/widgets/bim-components/index.ts";

export const toolbarUi = (
	components: Components,
	world: World,
) =>
	BUI.Component.create(() => {
		return BUI.html`
      <bim-tabs floating style="justify-self: center; border-radius: 0.5rem;">
        <bim-tab label="Info">
          <bim-toolbar>
            <!-- ${load(components)} -->
            ${custom(components)}
          </bim-toolbar>
        </bim-tab>
        <bim-tab label="Selection">
          <bim-toolbar>
            ${camera(world)}
            ${selection(components, world)}
          </bim-toolbar>
        </bim-tab>
        <bim-tab label="Measurement">
          <bim-toolbar>
            ${measurement(world, components)}
          </bim-toolbar>      
        </bim-tab>
      </bim-tabs>
    `;
	});
