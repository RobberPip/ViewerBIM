import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { createClassifierManager, ClassifierManager } from "../classifications";

const CLASSIFICATION_NAME = "Categories";

export default (components: OBC.Components) => {
    const classifierManager: ClassifierManager = createClassifierManager(components);
    const classifier = components.get(OBC.Classifier);
    const highlighter = components.get(OBF.Highlighter);
    const hider = components.get(OBC.Hider);
    const fragments = components.get(OBC.FragmentsManager);

    const table = document.createElement("bim-table") as BUI.Table;
    table.headersHidden = true;
    table.columns = [
        { header: "Category", width: "flex" },
        { header: "Actions", width: 120 }
    ];

    const buildTableData = (): BUI.TableGroupData[] => {
        const data: BUI.TableGroupData[] = [];
        const categoriesMap = classifier.list.get(CLASSIFICATION_NAME);
        if (!categoriesMap) return data;

        for (const [categoryName] of categoriesMap) {
            data.push({ 
                data: { 
                    Category: categoryName,
                    Actions: categoryName
                } 
            });
        }

        data.sort((a, b) =>
            String(a.data.Category ?? "").localeCompare(String(b.data.Category ?? "")),
        );

        return data;
    };

    const refreshTable = () => {
        table.data = buildTableData();
    };

    // Передаем refreshTable в classifyAll
    const classifyAllWithRefresh = () => classifierManager.classifyAll(refreshTable);

    table.dataTransform = {
        Category: (value) => {
            if (typeof value !== "string") return value;
            const categoryName = value;
            const categoriesMap = classifier.list.get(CLASSIFICATION_NAME);
            const groupData = categoriesMap?.get(categoryName);

            const count = (() => {
                if (!groupData) return 0;
                let total = 0;
                for (const ids of Object.values(groupData.map)) {
                    total += ids.size;
                }
                return total;
            })();

            return BUI.html`
                <div style="display: flex; justify-content: space-between; align-items: center; flex: 1; gap: 0.5rem; padding: 0.25rem 0;">
                    <bim-label style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${categoryName}
                    </bim-label>
                    <bim-label style="flex: 0; opacity: 0.6; font-size: 0.8em;">
                        (${count})
                    </bim-label>
                </div>
            `;
        },
        Actions: (categoryName: string) => {
            return BUI.html`
                <div style="display: flex; gap: 0.25rem; padding: 0.25rem 0;">
                    <bim-button 
                        size="small" 
                        fab 
                        outlined
                        icon="mdi:eye-off" 
                        tooltip="Hide"
                        ?loading=${false}
                        @click=${(e: Event) => handleHide(e, categoryName)}
                        style="width: 28px; height: 28px;"
                    ></bim-button>
                    <bim-button 
                        size="small" 
                        fab 
                        outlined
                        icon="mdi:filter-outline" 
                        tooltip="Isolate"
                        ?loading=${false}
                        @click=${(e: Event) => handleIsolate(e, categoryName)}
                        style="width: 28px; height: 28px;"
                    ></bim-button>
          
                    <bim-button 
                        size="small" 
                        fab 
                        outlined
                        icon="mdi:cursor-default-click"
                        tooltip="Select All"
                        ?loading=${false}
                        @click=${(e: Event) => handleSelect(e, categoryName)}
                        style="width: 28px; height: 28px; opacity: 1 !important; visibility: visible !important;"
                    ></bim-button>
                </div>
            `;
        }
    };

    const handleSelect = async (e: Event, categoryName: string) => {
        e.stopPropagation();
        try {
            const modelIdMap = await classifierManager.getModelIdMap(categoryName);
            if (modelIdMap) {
                await highlighter.highlightByID("select", modelIdMap, false, false);
            }
        } catch (error) {
            console.warn("Select failed:", error);
        }
    };

    const handleHide = async (e: Event, categoryName: string) => {
        e.stopPropagation();
        const button = e.currentTarget as BUI.Button;
        (button as any).loading = true;
        try {
            const modelIdMap = await classifierManager.getModelIdMap(categoryName);
            if (modelIdMap) {
                await hider.toggle(modelIdMap);
            }
        } catch (error) {
            console.warn("Hide failed:", error);
        } finally {
            (button as any).loading = false;
        }
    };

    const handleIsolate = async (e: Event, categoryName: string) => {
        e.stopPropagation();
        const button = e.currentTarget as BUI.Button;
        (button as any).loading = true;
        try {
            const modelIdMap = await classifierManager.getModelIdMap(categoryName);
            if (modelIdMap) {
                await hider.isolate(modelIdMap);
            }
        } catch (error) {
            console.warn("Isolate failed:", error);
        } finally {
            (button as any).loading = false;
        }
    };

    // Подписки с обновлением таблицы ✅
    fragments.onFragmentsLoaded.add(async (_model: FRAGS.FragmentsModel) => {
        await classifyAllWithRefresh();
    });

    fragments.list.onItemDeleted.add(() => {
        refreshTable();
    });

    // Инициализация ✅


    const search = (e: Event) => {
        const input = e.target as BUI.TextInput;
        table.queryString = input.value;
    };

    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html`
            <bim-panel-section label="IFC Categories" icon="ph:list-bold">
                <div style="display: flex; gap: 0.375rem; margin-bottom: 0.5rem;">
                    <bim-text-input 
                        @input=${search} 
                        vertical 
                        placeholder="Search categories..." 
                        debounce="200"
                    ></bim-text-input>
                    <bim-button 
                        style="flex: 0;" 
                        @click=${classifyAllWithRefresh} 
                        icon="mdi:refresh" 
                        tooltip="Refresh"
                    ></bim-button>
                </div>
                ${table}
            </bim-panel-section>
        `;
    });
};
