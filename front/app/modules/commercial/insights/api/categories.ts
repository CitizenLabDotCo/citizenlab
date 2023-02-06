import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors, IRelationship } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { inputKeys } from './inputs';
import { statsKeys } from './stats';

const categoryKeys = {
  all: () => [{ type: 'category' }] as const,
  lists: () => [{ ...categoryKeys.all()[0], entity: 'list' }] as const,
  details: () => [{ ...categoryKeys.all()[0], entity: 'detail' }] as const,
  detail: (id: string) =>
    [
      {
        ...categoryKeys.details()[0],
        id,
      },
    ] as const,
};

type CategoryKeys = ReturnType<typeof categoryKeys[keyof typeof categoryKeys]>;

export interface IInsightsCategoryData {
  id: string;
  type: string;
  attributes: {
    name: string;
    inputs_count: number;
  };
  relationships?: {
    view: {
      data: IRelationship;
    };
  };
}

export interface IInsightsCategory {
  data: IInsightsCategoryData;
}

export interface IInsightsCategories {
  data: IInsightsCategoryData[];
}

const fetchCategories = (viewId: string) =>
  fetcher<IInsightsCategories>({
    path: `/insights/views/${viewId}/categories`,
    action: 'get',
  });

export const useCategories = (viewId: string) => {
  return useQuery<
    IInsightsCategories,
    CLErrors,
    IInsightsCategories,
    CategoryKeys
  >({
    queryKey: categoryKeys.lists(),
    queryFn: () => fetchCategories(viewId),
  });
};

const fetchCategory = (viewId: string, id: string) =>
  fetcher<IInsightsCategory>({
    path: `/insights/views/${viewId}/categories/${id}`,
    action: 'get',
  });

export const useCategory = (viewId: string, id: string) => {
  return useQuery<IInsightsCategory, CLErrors, IInsightsCategory, CategoryKeys>(
    {
      queryKey: categoryKeys.detail(id),
      queryFn: () => fetchCategory(viewId, id),
    }
  );
};

interface AddInsightsCategoryParams {
  viewId: string;
  name: string;
  inputs?: {
    keywords?: string[];
    categories?: string[];
    search?: string;
  };
}

const addCategory = async ({
  viewId,
  ...requestBody
}: AddInsightsCategoryParams) =>
  fetcher<IInsightsCategory>({
    path: `/insights/views/${viewId}/categories`,
    action: 'create',
    body: requestBody,
  });

export const useAddCategory = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsCategory, CLErrors, AddInsightsCategoryParams>({
    mutationFn: addCategory,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      onSuccess && onSuccess();
    },
  });
};

// export async function addInsightsCategory({
//   insightsViewId,
//   name,
//   inputs,
// }: AddInsightsCategoryParams) {
//   const response = await streams.add<IInsightsCategory>(
//     `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
//     {
//       category: { name, inputs },
//     }
//   );
//   streams.fetchAllWith({
//     partialApiEndpoint: [
//       `insights/views/${insightsViewId}/inputs`,
//       `insights/views/${insightsViewId}/categories`,
//     ],
//   });
//   return response;
// }

// export function updateInsightsCategory(
//   insightsViewId: string,
//   insightsCategoryId: string,
//   name: string
// ) {
//   return streams.update<IInsightsCategories>(
//     `${API_PATH}/${getInsightsCategoriesEndpoint(
//       insightsViewId
//     )}/${insightsCategoryId}`,
//     insightsCategoryId,
//     { category: { name } }
//   );
// }

// export async function deleteInsightsCategories(insightsViewId: string) {
//   const response = await streams.delete(
//     `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
//     ''
//   );

//   streams.fetchAllWith({
//     partialApiEndpoint: [
//       `insights/views/${insightsViewId}/inputs`,
//       `insights/views/${insightsViewId}/categories`,
//       `insights/views/${insightsViewId}/stats/inputs_count`,
//     ],
//   });

//   return response;
// }

// export function deleteInsightsCategory(
//   insightsViewId: string,
//   insightsCategoryId: string
// ) {
//   return streams.delete(
//     `${API_PATH}/${getInsightsCategoriesEndpoint(
//       insightsViewId
//     )}/${insightsCategoryId}`,
//     insightsCategoryId
//   );
// }

const deleteInputCategory = ({
  viewId,
  inputId,
  categoryId,
}: {
  viewId: string;
  inputId: string;
  categoryId: string;
}) =>
  fetcher({
    path: `/insights/views/${viewId}/${inputId}/${categoryId}`,
    action: 'delete',
  });

export const useDeleteInputCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInputCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: inputKeys.lists() });
      queryClient.invalidateQueries({ queryKey: statsKeys.details() });
      queryClient.invalidateQueries({
        queryKey: inputKeys.detail(variables.viewId, variables.inputId),
      });
    },
  });
};

// export async function deleteInsightsInputCategory(
//   insightsViewId: string,
//   insightsInputId: string,
//   insightsCategoryId: string
// ) {
//   const response = await streams.delete(
//     `${API_PATH}/${getInsightsInputsEndpoint(
//       insightsViewId
//     )}/${insightsInputId}/categories/${insightsCategoryId}`,
//     insightsCategoryId
//   );

//   streams.fetchAllWith({
//     partialApiEndpoint: [
//       `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
//       `insights/views/${insightsViewId}/categories`,
//       `insights/views/${insightsViewId}/stats/inputs_count`,
//     ],
//   });

//   return response;
// }

// export async function addInsightsInputCategory(
//   insightsViewId: string,
//   insightsInputId: string,
//   insightsCategoryId: string
// ) {
//   const response = await streams.add(
//     `${API_PATH}/${getInsightsInputsEndpoint(
//       insightsViewId
//     )}/${insightsInputId}/categories`,
//     { data: [{ id: insightsCategoryId, type: 'category' }] }
//   );

//   streams.fetchAllWith({
//     partialApiEndpoint: [
//       `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
//       `insights/views/${insightsViewId}/categories`,
//       `insights/views/${insightsViewId}/stats/inputs_count`,
//     ],
//   });

//   return response;
// }

// export async function addInsightsInputCategories(
//   insightsViewId: string,
//   insightsInputId: string,
//   insightsCategories: { id: string; type: string }[]
// ) {
//   const response = await streams.add(
//     `${API_PATH}/${getInsightsInputsEndpoint(
//       insightsViewId
//     )}/${insightsInputId}/categories`,
//     { data: insightsCategories }
//   );

//   await streams.fetchAllWith({
//     partialApiEndpoint: [
//       `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
//       `insights/views/${insightsViewId}/categories`,
//       `insights/views/${insightsViewId}/stats/inputs_count`,
//     ],
//   });

//   return response;
// }
