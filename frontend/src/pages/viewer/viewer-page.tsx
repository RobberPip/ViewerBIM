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
export let jsonModelsBlobs: { name: string; blob: Blob }[] = [];

export const ViewerPage = () => {
	const params = useUnit($urlsIFC);
	const loaderId = useUnit($projectId);
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

			const viewCube = document.createElement("bim-view-cube");
			viewCube.camera = world.camera.three;
			viewport.append(viewCube);

			world.camera.controls.addEventListener("update", () =>
				viewCube.updateOrientation(),
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

			postproduction.enabled = true;
			postproduction.customEffects.excludedMeshes.push(worldGrid.three);
			postproduction.setPasses({ custom: true, ao: true, gamma: true });
			postproduction.customEffects.lineColor = 0x17191c;

			const appManager = components.get(AppManager);
			const appElement = document.getElementById("bim");
			if (appElement) {
				const viewportGrid =
					viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
				appManager.grids.set("viewport", viewportGrid);

				const fragments = components.get(OBC.FragmentsManager);
				const indexer = components.get(OBC.IfcRelationsIndexer);
				const classifier = components.get(OBC.Classifier);
				classifier.list.CustomSelections = {};

				const ifcLoader = components.get(OBC.IfcLoader);
				ifcLoader.setup();

				const tilesLoader = components.get(OBF.IfcStreamer);
				tilesLoader.world = world;
				tilesLoader.culler.threshold = 10;
				tilesLoader.culler.maxHiddenTime = 1000;
				tilesLoader.culler.maxLostTime = 40000;

				highlighter.setup({ world });
				highlighter.zoomToSelection = true;

				const culler = components.get(OBC.Cullers).create(world);
				culler.threshold = 5;

				world.camera.controls.restThreshold = 0.25;
				world.camera.controls.addEventListener("rest", () => {
					culler.needsUpdate = true;
					tilesLoader.cancel = true;
					tilesLoader.culler.needsUpdate = true;
				});

				fragments.onFragmentsLoaded.add(async (model) => {
					if (model.hasProperties) {
						await indexer.process(model);
						classifier.byEntity(model);
					}

					if (!model.isStreamed) {
						for (const fragment of model.items) {
							world.meshes.add(fragment.mesh);
							culler.add(fragment.mesh);
						}
					}

					world.scene.three.add(model);

					if (!model.isStreamed) {
						setTimeout(async () => {
							world.camera.fit(world.meshes, 0.8);
						}, 50);
					}
				});

				fragments.onFragmentsDisposed.add(({ fragmentIDs }) => {
					for (const fragmentID of fragmentIDs) {
						const mesh = [...world.meshes].find(
							(mesh) => mesh.uuid === fragmentID,
						);
						if (mesh) {
							world.meshes.delete(mesh);
						}
					}
				});

				// const createViewPrint = async () => {
				// 	const marker = components.get(OBF.Marker);
				// 	const viewpoints = components.get(OBC.Viewpoints);
				// 	const viewpoint = viewpoints.create(world, {
				// 		title: "ViewPoint",
				// 	});
				// 	viewpoint.updateCamera();
				// 	const position = viewpoint.camera.position;
				// 	const direction = viewpoint.camera.direction;
				// 	const target = {
				// 		x: position.x + direction.x * 80,
				// 		y: position.y + direction.y * 80,
				// 		z: position.z + direction.z * 80,
				// 	};

				// 	// addCamera(viewpoint);
				// 	// marker.create(world, "🚀", new THREE.Vector3(cam.x, cam.y, cam.z));

				// 	const renderer = world.renderer;
				// 	if (!renderer) {
				// 		throw new Error("A renderer is needed for the raycaster to work!");
				// 	}
				// 	marker.threshold = 50;
				// 	const issuePayload: ProjectComponets["schemas"]["IssueIn"] = {
				// 		position: JSON.stringify({
				// 			x: position.x,
				// 			y: position.y,
				// 			z: position.z,
				// 		}),
				// 		target: JSON.stringify(target),
				// 		loaderId: loaderId,
				// 	};
				// 	addIssueMutation.start(issuePayload);
				// };

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

				app.layout = "main";
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

				viewportGrid.layout = "second";
				// LOAD AUTO IFC
				const fragmentIfcLoader = components.get(OBC.IfcLoader);
				await fragmentIfcLoader.setup();
				setIsLoading(true);
				async function loadMultipleIfcs(urls: string[]) {
					let loaded = 0;
					const total = urls.length;

					for (const url of urls) {
						const file = await fetch(url);
						const data = await file.arrayBuffer();
						const buffer = new Uint8Array(data);

						const model = await fragmentIfcLoader.load(buffer);
						model.name = url.split("/").pop() || "model";
						world.scene.three.add(model);

						const indexer = components.get(OBC.IfcRelationsIndexer);
						await indexer.process(model);
						const allDataMap = new Map();

						for (const item of model.items) {
							for (const id of item.ids) {
								const psets = indexer.getEntityRelations(model, id, "IsDefinedBy");
								const propMap = new Map();

								const elementProps = await model.getProperties(id);
								const category = elementProps?.ObjectType || null;
								const name = elementProps?.Name || null;
								const type = OBC.IfcCategoryMap[elementProps?.type] || null;

								for (const expressID of psets) {
									await OBC.IfcPropertiesUtils.getPsetProps(model, expressID, async (propExpressID) => {
										const prop = await model.getProperties(propExpressID);
										if (prop && prop.expressID && !propMap.has(prop.expressID)) {
											propMap.set(prop.expressID, prop);
										}
									});
								}

								if (allDataMap.has(id)) {
									const existingEntry = allDataMap.get(id);
									for (const [propID, prop] of propMap) {
										if (!existingEntry.propsMap.has(propID)) {
											existingEntry.propsMap.set(propID, prop);
										}
									}
									if (!existingEntry.category && category) existingEntry.category = category;
									if (!existingEntry.name && name) existingEntry.name = name;
									if (!existingEntry.ifcType && type) existingEntry.ifcType = type;
								} else {
									allDataMap.set(id, {
										propsMap: propMap,
										category,
										name,
										ifcType: type,
									});
								}
							}
						}

						// Преобразуем Map в массив
						const allData = Array.from(allDataMap.entries()).map(
							([itemId, { propsMap, category, name, ifcType }]) => ({
								itemId,
								category,
								name,
								ifcType,
								props: Array.from(propsMap.values()),
							})
						);

						// Преобразуем в JSON blob и добавляем в массив
						const modelJson = JSON.stringify(allData, null, 2);
						const blobJson = new Blob([modelJson], { type: "application/json" });
						jsonModelsBlobs.push({
						name: `${model.name}_props_by_item.json`, 
						blob: blobJson
					});
						Models.push(model);
						loaded++;
						setProgress(Math.floor((loaded / total) * 100));
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
