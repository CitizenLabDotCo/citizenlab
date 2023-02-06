import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { inputKeys } from './inputs';

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
