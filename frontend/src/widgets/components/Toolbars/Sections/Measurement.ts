import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";

type MeasureComponent =
	| OBF.VolumeMeasurement
	| OBF.LengthMeasurement
	| OBF.AreaMeasurement;

export default (world: OBC.World, components: OBC.Components) => {
	const Volume = components.get(OBF.VolumeMeasurement);
	const Length = components.get(OBF.LengthMeasurement);
	const Area = components.get(OBF.AreaMeasurement);

	Volume.world = world;
	Length.world = world;
	Area.world = world;

	const tools: { [key: string]: MeasureComponent } = {
		Volume,
		Length,
		Area,
	};

	const getEnabled = () => {
		const checkbox = document.getElementById(
			"measurement-checkbox",
		) as BUI.Checkbox;
		if (!checkbox) {
			return false;
		}
		return checkbox.value;
	};

	const getSelected = () => {
		const dropdown = document.getElementById(
			"measurement-dropdown",
		) as BUI.Dropdown;

		return dropdown.value[0];
	};

	const createDimension = () => {
		const selected = getSelected();
		if (!selected) {
			return;
		}

		tools[selected].create();
	};

	const deleteDimension = (event: KeyboardEvent) => {
		if (event.code === "Delete") {
			const selected = getSelected();
			if (!selected) {
				return;
			}

			tools[selected].delete();
		}
	};

	const setupHighlighter = () => {
		const enabled = getEnabled();
		const selected = getSelected();

		const highlighter = components.get(OBF.Highlighter);
		highlighter.enabled = !enabled || selected === "Volume";
	};

	const setupEvents = () => {
		const selected = getSelected();
		const enabled = getEnabled();

		window.removeEventListener("dblclick", createDimension);
		window.removeEventListener("keydown", deleteDimension);

		if (enabled && selected !== "Volume") {
			window.addEventListener("dblclick", createDimension);
			window.addEventListener("keydown", deleteDimension);
		}
	};

	const deleteAll = () => {
		for (const tool of Object.values(tools)) {
			tool.list.clear();
		}
	};

	const onEnabled = () => {
		const selected = getSelected();
		if (!selected) {
			return;
		}

		tools[selected].enabled = !!selected;

		setupEvents();
		setupHighlighter();
	};

	const onToolChanged = (event: InputEvent) => {
		const enabled = getEnabled();
		if (!enabled) {
			return;
		}

		const target = event.target as BUI.Dropdown;
		const selected = target.value[0];

		for (const key in tools) {
			const tool = tools[key];
			tool.enabled = selected === key;
		}

		setupEvents();
		setupHighlighter();
	};

	const dropDown = BUI.Component.create<BUI.Dropdown>(() => {
		return BUI.html`
        <bim-dropdown id="measurement-dropdown" @change="${onToolChanged}">
            <bim-option label="Volume"></bim-option>
            <bim-option label="Length"></bim-option>
            <bim-option label="Area"></bim-option>
        </bim-dropdown>
    `;
	});

	dropDown.value = ["Length"];

	return BUI.Component.create<BUI.PanelSection>(() => {
		return BUI.html`
      <bim-toolbar-section label="Measurements" icon="tdesign:measurement-1" style="pointer-events: auto">
        <bim-checkbox id="measurement-checkbox" @change="${onEnabled}" label="Enabled" icon="material-symbols:fit-screen-rounded"></bim-checkbox>
        <bim-button @click="${deleteAll}" label="Delete all" icon="material-symbols:fit-screen-rounded"></bim-button>
        ${dropDown}
      </bim-toolbar-section>
    `;
	});
};
