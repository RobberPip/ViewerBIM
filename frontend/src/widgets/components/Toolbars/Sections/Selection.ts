import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";

// highlighter.selection.select возвращает Record<string, Set<number>>
// Hider.toggle/isolate/set принимает ModelIdMap = Record<string, Set<number>>
// Они совместимы по типу — оба Set<number>
export default (components: OBC.Components, world?: OBC.World) => {
  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);

  const getSelection = (): OBC.ModelIdMap => {
    const sel = highlighter.selection["select"];
    if (!sel) return {};
    // Убеждаемся что values — Set<number>
    const result: OBC.ModelIdMap = {};
    for (const [modelId, ids] of Object.entries(sel)) {
      result[modelId] = ids instanceof Set ? ids : new Set(ids as any);
    }
    return result;
  };

  const onToggleVisibility = async () => {
    const selection = getSelection();
    if (Object.keys(selection).length === 0) return;
    await hider.toggle(selection);
  };

  const onIsolate = async () => {
    const selection = getSelection();
    if (Object.keys(selection).length === 0) return;
    await hider.isolate(selection);
  };

  const onShowAll = async () => {
    await hider.set(true);
  };

  const onFocusSelection = async () => {
    if (!world) return;
    if (!world.camera.hasCameraControls()) return;

    const selected = getSelection();
    if (!Object.keys(selected).length) return;

    const bbox = components.get(OBC.BoundingBoxer);
    bbox.list.clear();
    await bbox.addFromModelIdMap(selected);
    const box = bbox.get();

    if (box.isEmpty()) return;

    const sphere = box.getBoundingSphere(new (await import("three")).Sphere());
    sphere.radius *= 1.2;
    await world.camera.controls.fitToSphere(sphere, true);
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Selection" icon="ph:cursor-fill">
        <bim-button @click=${onShowAll} label="Show All" icon="tabler:eye-filled" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
        <bim-button @click=${onToggleVisibility} label="Toggle Visibility" icon="tabler:square-toggle" tooltip-title="Toggle Visibility" tooltip-text="From the current selection, hides visible elements and shows hidden elements."></bim-button>
        <bim-button @click=${onIsolate} label="Isolate" icon="prime:filter-fill" tooltip-title="Isolate" tooltip-text="Isolates the current selection."></bim-button>
        <bim-button @click=${onFocusSelection} label="Focus" icon="ri:focus-mode" tooltip-title="Focus" tooltip-text="Focus the camera to the current selection."></bim-button>
      </bim-toolbar-section>
    `;
  });
};
