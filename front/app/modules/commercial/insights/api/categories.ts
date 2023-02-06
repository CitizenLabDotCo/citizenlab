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

// import { API_PATH } from 'containers/App/constants';
// import streams, { IStreamParams } from 'utils/streams';
// import { IRelationship } from 'typings';

// const getInsightsCategoriesEndpoint = (viewId: string) =>
//   `insights/views/${viewId}/categories`;

// export function insightsCategoriesStream(
//   insightsViewId: string,
//   streamParams: IStreamParams | null = null
// ) {
//   return streams.get<IInsightsCategories>({
//     apiEndpoint: `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
//     ...streamParams,
//   });
// }

// export function insightsCategoryStream(
//   insightsViewId: string,
//   insightsCategoryId: string,
//   streamParams: IStreamParams | null = null
// ) {
//   return streams.get<IInsightsCategory>({
//     apiEndpoint: `${API_PATH}/${getInsightsCategoriesEndpoint(
//       insightsViewId
//     )}/${insightsCategoryId}`,
//     ...streamParams,
//   });
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
        queryKey: inputKeys.detail(variables.viewId),
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
