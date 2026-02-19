import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { AppManager } from "../../widgets/bim-components/index.ts";
import { useEffect, useState } from "react";
import { viewport } from "./ui/viewport.tsx";
import { itemInfoPanelUi } from "./ui/itemInfoPanel.tsx";
import { leftPanelUi } from "./ui/leftPanel.tsx";
import { toolbarUi } from "./ui/toolbar.tsx";
import {
	components,
	highlighter,
	Models,
	resetComponents,
	WorldModel,
} from "~/shared/lib/untils.ts";
import {
	$urlsIFC,
	$projectId,
} from "./model.ts";
import { useUnit } from "effector-react";
import { createClassifierManager } from "~/widgets/components/classifications.tsx";
export let jsonModelsBlobs: { name: string; blob: Blob }[] = [];

export const ViewerPage = () => {
	const params = useUnit($urlsIFC);
	useUnit($projectId); // used for project context
	const [isLoading, setIsLoading] = useState(true);
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		const run = async () => {
			BUI.Manager.init();
			CUI.Manager.init();
			resetComponents();
			const worlds = components.get(OBC.Worlds);

			const world = worlds.create<
				OBC.SimpleScene,
				OBC.OrthoPerspectiveCamera,
				OBF.PostproductionRenderer
			>();
			WorldModel.value = world;
			world.name = "Main";

			world.scene = new OBC.SimpleScene(components);
			world.scene.setup();
			world.scene.three.background = null;

			world.renderer = new OBF.PostproductionRenderer(components, viewport);
			const { postproduction } = world.renderer;

			world.camera = new OBC.OrthoPerspectiveCamera(components);

			const viewCube = document.createElement("bim-view-cube") as any;
			viewCube.camera = world.camera.three;
			viewport.append(viewCube);

			world.camera.controls.addEventListener("update", () =>
				viewCube.updateOrientation?.(),
			);

			const worldGrid = components.get(OBC.Grids).create(world);
			worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
			worldGrid.material.uniforms.uSize1.value = 2;
			worldGrid.material.uniforms.uSize2.value = 8;

			const resizeWorld = () => {
				world.renderer?.resize();
				world.camera.updateAspect();
			};

			viewport.addEventListener("resize", resizeWorld);

			components.init();

			// v3: Postproduction API simplified — only style setter
			postproduction.style = OBF.PostproductionAspect.COLOR_PEN;

			const appManager = components.get(AppManager);
			const appElement = document.getElementById("bim");
			if (appElement) {
				const viewportGrid =
					viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
				appManager.grids.set("viewport", viewportGrid);

				// Инициализируем FragmentsManager с воркером
				const fragments = components.get(OBC.FragmentsManager);
				fragments.init("/worker.mjs");

				// Обновляем фрагменты при движении камеры
				world.camera.controls.addEventListener("update", () =>
					fragments.core.update(),
				);

				highlighter.setup({ world });
				highlighter.zoomToSelection = true;

				const toolbar = toolbarUi(components, world);
				const leftPanel = leftPanelUi(components);
				const entityAttributesPanel = itemInfoPanelUi(components, highlighter);

				document.body.appendChild(entityAttributesPanel);
				const app = appElement as BUI.Grid;
				app.layouts = {
					main: {
						template: `
							"leftPanel viewport" 1fr
							/26rem 1fr
						`,
						elements: {
							leftPanel,
							viewport,
						},
					},
				};

				(app as any).layout = "main";
				viewportGrid.layouts = {
					main: {
						template: `
							"empty" 1fr
							"toolbar" auto
							/1fr
						`,
						elements: { toolbar },
					},
					second: {
						template: `
							"empty entityAttributesPanel" 1fr
							"toolbar entityAttributesPanel" auto
							/1fr 40rem
						`,
						elements: {
							toolbar,
							entityAttributesPanel,
						},
					},
				};

				(viewportGrid as any).layout = "second";

				// Загрузка IFC файлов через IfcImporter (v3 API)
				const ifcLoader = components.get(OBC.IfcLoader);
				await ifcLoader.setup({
					autoSetWasm: false,
					wasm: {
						path: "/",
						absolute: true,
					},
				});

				setIsLoading(true);

				async function loadMultipleIfcs(urls: string[]) {
					let loaded = 0;
					const total = urls.length;

					for (const url of urls) {
						const file = await fetch(url);
						const data = await file.arrayBuffer();
						const buffer = new Uint8Array(data);

						const modelName = url.split("/").pop() || `model_${loaded}`;

						const model = await ifcLoader.load(buffer, true, modelName);

						// Добавляем модель в сцену
						world.scene.three.add(model.object);
						model.useCamera(world.camera.three);
						await fragments.core.update(true);

						Models.push(model);
						loaded++;
						setProgress(Math.floor((loaded / total) * 100));
					}

					// Подгоняем камеру по bounding box всех моделей
					if (Models.length > 0) {
						const bbox = new THREE.Box3();
						for (const m of Models) {
							bbox.expandByObject(m.object);
						}
						if (!bbox.isEmpty()) {
							const sphere = bbox.getBoundingSphere(new THREE.Sphere());
							sphere.radius *= 1.2;
							await world.camera.controls.fitToSphere(sphere, true);
						}
					}
				}

				await loadMultipleIfcs(params);
				
				setIsLoading(false);
			} else {
				console.error('Элемент с id "bim" не найден');
			}
		};

		run();
	}, [params]);

	return (
		<div style={{ height: "100vh", position: "relative" }}>
			<bim-grid id="bim" style={{ height: "100%" }} />
			{isLoading && (
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "rgba(255, 255, 255, 0.8)",
						zIndex: 10,
						flexDirection: "column",
					}}
				>
					<span style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
						Загрузка моделей... {progress}%
					</span>
					<div
						style={{
							width: "300px",
							height: "20px",
							backgroundColor: "#ccc",
							borderRadius: "10px",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: `${progress}%`,
								height: "100%",
								backgroundColor: "#3f51b5",
								transition: "width 0.3s",
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
