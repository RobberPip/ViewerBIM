import * as OBC from "@thatopen/components";

const CLASSIFICATION_NAME = "Categories";

export interface ClassifierManager {
  classifyAll: (refreshCallback?: () => void) => Promise<void>;
  getModelIdMap: (categoryName: string) => Promise<OBC.ModelIdMap | null>;
}

export const createClassifierManager = (components: OBC.Components): ClassifierManager => {
  const classifier = components.get(OBC.Classifier);
  
  const getModelIdMap = async (categoryName: string): Promise<OBC.ModelIdMap | null> => {
    const categoriesMap = classifier.list.get(CLASSIFICATION_NAME);
    const groupData = categoriesMap?.get(categoryName);
    if (!groupData) return null;
    return await groupData.get();
  };

  const classifyAll = async (refreshCallback?: () => void): Promise<void> => {
    await classifier.byCategory({ classificationName: CLASSIFICATION_NAME });
    refreshCallback?.();
  };

  return {
    classifyAll,
    getModelIdMap
  };
};
