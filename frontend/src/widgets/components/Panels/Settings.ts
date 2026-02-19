import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front";
import { WorldModel } from "~/shared/lib/untils.ts";

export default () => {
  const html = document.querySelector("html")!;

  const onThemeChange = (event: Event) => {
    const selector = event.target as BUI.Selector;
    if (
      selector.value === undefined ||
      selector.value === null ||
      selector.value === 0
    ) {
      html.classList.remove("bim-ui-dark", "bim-ui-light");
    } else if (selector.value === 1) {
      html.className = "bim-ui-dark";
    } else if (selector.value === 2) {
      html.className = "bim-ui-light";
    }
  };

  const onPostproductionChange = (event: Event) => {
    const selector = event.target as BUI.Selector;
    const world = WorldModel.value;
    if (!world) return;
    const renderer = world.renderer as OBF.PostproductionRenderer;
    if (!renderer?.postproduction) return;
    const pp = renderer.postproduction;
    if (selector.value === 0) {
      pp.style = OBF.PostproductionAspect.COLOR;
    } else if (selector.value === 1) {
      pp.style = OBF.PostproductionAspect.COLOR_PEN;
    } else if (selector.value === 2) {
      pp.style = OBF.PostproductionAspect.COLOR_PEN_SHADOWS;
    } else if (selector.value === 3) {
      pp.style = OBF.PostproductionAspect.PEN;
    }
  };

  const onGridToggle = (event: Event) => {
    const checkbox = event.target as BUI.Checkbox;
    const world = WorldModel.value;
    if (!world) return;
    const visible = (checkbox as any).checked ?? (checkbox as any).value;
    // Ищем объект сетки в сцене
    world.scene.three.traverse((obj: any) => {
      if (obj.isGridHelper || obj.name === "SimpleGrid" || obj.type === "GridHelper") {
        obj.visible = visible;
      }
    });
  };

  const onAmbientLightChange = (event: Event) => {
    const input = event.target as BUI.NumberInput;
    const world = WorldModel.value;
    if (!world) return;
    const scene = world.scene as any;
    if (scene.ambientLights) {
      for (const light of scene.ambientLights.values()) {
        light.intensity = input.value ?? 1;
      }
    }
  };

  const onDirectionalLightChange = (event: Event) => {
    const input = event.target as BUI.NumberInput;
    const world = WorldModel.value;
    if (!world) return;
    const scene = world.scene as any;
    if (scene.directionalLights) {
      for (const light of scene.directionalLights.values()) {
        light.intensity = input.value ?? 1.5;
      }
    }
  };

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="Aspect" icon="solar:palette-bold">
          <bim-selector vertical @change=${onThemeChange}>
            <bim-option
              value="0"
              label="System"
              icon="majesticons:laptop"
              .checked=${
                !html.classList.contains("bim-ui-dark") &&
                !html.classList.contains("bim-ui-light")
              }>
            </bim-option>
            <bim-option value="1" label="Dark" icon="solar:moon-bold" .checked=${html.classList.contains("bim-ui-dark")}></bim-option>
            <bim-option value="2" label="Light" icon="solar:sun-bold" .checked=${html.classList.contains("bim-ui-light")}></bim-option>
          </bim-selector>
        </bim-panel-section>

        <bim-panel-section label="Postproduction" icon="mage:stars-c">
          <bim-selector vertical @change=${onPostproductionChange}>
            <bim-option value="0" label="Color" icon="mdi:palette" .checked=${false}></bim-option>
            <bim-option value="1" label="Color + Pen" icon="mdi:draw-pen" .checked=${true}></bim-option>
            <bim-option value="2" label="Color + Pen + Shadows" icon="mdi:weather-sunny" .checked=${false}></bim-option>
            <bim-option value="3" label="Pen Only" icon="mdi:pen" .checked=${false}></bim-option>
          </bim-selector>
        </bim-panel-section>

        <bim-panel-section label="Lighting" icon="ph:sun-bold">
          <bim-number-input
            vertical
            label="Ambient Intensity"
            min="0"
            max="5"
            step="0.1"
            @change=${onAmbientLightChange}
          ></bim-number-input>
          <bim-number-input
            vertical
            label="Directional Intensity"
            min="0"
            max="5"
            step="0.1"
            @change=${onDirectionalLightChange}
          ></bim-number-input>
        </bim-panel-section>

        <bim-panel-section label="Scene" icon="ph:grid-four">
          <bim-checkbox label="Show Grid" checked @change=${onGridToggle}></bim-checkbox>
        </bim-panel-section>
      </bim-panel>
    `;
  });
};
