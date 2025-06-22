import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import type { FragmentsGroup } from "@thatopen/fragments";

export let components = new OBC.Components();
export const WorldModel = {
	value: null as OBC.SimpleWorld<
		OBC.SimpleScene,
		OBC.OrthoPerspectiveCamera,
		OBF.PostproductionRenderer
	> | null,
};

export let highlighter = components.get(OBF.Highlighter);
export const Models: FragmentsGroup[] = [];
export function resetComponents() {
	// Вызываем dispose для текущих компонентов
	components.dispose();

	// Создаем новый экземпляр компонентов
	components = new OBC.Components();
	highlighter = components.get(OBF.Highlighter);
}
