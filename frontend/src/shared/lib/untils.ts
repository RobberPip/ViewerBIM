import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";

export let components = new OBC.Components();
export const WorldModel = {
	value: null as OBC.SimpleWorld<
		OBC.SimpleScene,
		OBC.OrthoPerspectiveCamera,
		OBF.PostproductionRenderer
	> | null,
};

// highlighter инициализируется после resetComponents, не при импорте
export let highlighter: OBF.Highlighter = components.get(OBF.Highlighter);
export const Models: FRAGS.FragmentsModel[] = [];

export function resetComponents() {
	// Сначала сбрасываем highlighter до dispose, чтобы избежать ошибок
	try {
		components.dispose();
	} catch (_) {
		// игнорируем ошибки при dispose (нет рендерера и т.д.)
	}
	Models.length = 0;
	WorldModel.value = null;

	components = new OBC.Components();
	highlighter = components.get(OBF.Highlighter);
}
