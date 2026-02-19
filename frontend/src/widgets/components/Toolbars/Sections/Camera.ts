import * as OBC from "@thatopen/components";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import { Models } from "~/shared/lib/untils.ts";

export default (world: OBC.World, _components: OBC.Components) => {
  const { camera } = world;

  const onFitModel = async () => {
    if (!(camera instanceof OBC.OrthoPerspectiveCamera)) return;

    // Пробуем через world.meshes (стандартный путь)
    if (world.meshes.size > 0) {
      await camera.fit(world.meshes, 0.5);
      return;
    }

    // Если world.meshes пуст (FragmentsModel), используем bounding box всех моделей
    if (Models.length > 0) {
      const bbox = new THREE.Box3();
      for (const model of Models) {
        bbox.expandByObject(model.object);
      }
      if (!bbox.isEmpty()) {
        const sphere = bbox.getBoundingSphere(new THREE.Sphere());
        sphere.radius *= 1.2;
        await camera.controls.fitToSphere(sphere, true);
      }
    }
  };

  const onLock = (e: Event) => {
    const button = e.target as BUI.Button;
    camera.enabled = !camera.enabled;
    button.active = !camera.enabled;
    button.label = camera.enabled ? "Disable" : "Enable";
    button.icon = camera.enabled
      ? "tabler:lock-filled"
      : "majesticons:unlock-open";
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Camera" icon="ph:camera-fill" style="pointer-events: auto">
        <bim-button label="Fit Model" icon="material-symbols:fit-screen-rounded" @click=${onFitModel}></bim-button>
        <bim-button label="Disable" icon="tabler:lock-filled" @click=${onLock} .active=${!camera.enabled}></bim-button>
      </bim-toolbar-section>
    `;
  });
};
