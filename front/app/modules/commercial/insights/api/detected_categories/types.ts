import detectedCategoriesKeys from './keys';

export type DetectedCategoriesKeys = ReturnType<
  typeof detectedCategoriesKeys[keyof typeof detectedCategoriesKeys]
>;

export type IInsightsDetectedCategoriesData = {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}[];

export interface IInsightsDetectedCategories {
  data: IInsightsDetectedCategoriesData;
}
