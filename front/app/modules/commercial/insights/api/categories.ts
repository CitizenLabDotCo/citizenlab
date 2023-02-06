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
type IInsightsCategoryUpdateObject = {
  viewId: string;
  categoryId: string;
  requestBody: { name: string };
};

const updateCategory = ({
  viewId,
  categoryId,
  requestBody,
}: IInsightsCategoryUpdateObject) =>
  fetcher<IInsightsCategory>({
    path: `/insights/views/${viewId}/categories/${categoryId}`,
    action: 'update',
    body: requestBody,
  });

export const useUpdateCategory = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<
    IInsightsCategory,
    CLErrors,
    IInsightsCategoryUpdateObject
  >({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      onSuccess && onSuccess();
    },
  });
};

const deleteAllCategories = (viewId: string) =>
  fetcher({
    path: `/insights/views/${viewId}/categories`,
    action: 'delete',
  });

export const useDeleteAllCategories = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllCategories,

    onSuccess: (_data, viewId) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: statsKeys.detail(viewId) });
      queryClient.invalidateQueries({ queryKey: inputKeys.list(viewId) });
      onSuccess && onSuccess();
    },
  });
};

const deleteCategory = ({
  viewId,
  categoryId,
}: {
  viewId: string;
  categoryId: string;
}) =>
  fetcher({
    path: `/insights/views/${viewId}/categories/${categoryId}`,
    action: 'delete',
  });

export const useDeleteCategory = ({
  onSuccess,
}: {
  onSuccess?: (categoryId: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      onSuccess && onSuccess(variables.categoryId);
    },
  });
};
