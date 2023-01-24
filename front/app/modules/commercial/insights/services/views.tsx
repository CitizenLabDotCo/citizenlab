import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import { CLErrors, IRelationship } from 'typings';
import { getJwt } from 'utils/auth/jwt';

export interface IInsightsViewData {
  id: string;
  type: 'view';
  attributes: {
    name: string;
    updated_at: string;
  };
  relationships?: {
    data_sources: {
      data: IRelationship[];
    };
  };
}

export interface IInsightsView {
  data: IInsightsViewData;
}

export interface IInsightsViews {
  data: IInsightsViewData[];
}

const jwt = getJwt();

const viewKeys = {
  all: () => [{ type: 'view' }] as const,
  lists: () => [{ ...viewKeys.all()[0], entity: 'list' }] as const,
  details: () => [{ ...viewKeys.all()[0], entity: 'detail' }] as const,
  detail: (id: number) =>
    [
      {
        ...viewKeys.details()[0],
        id,
      },
    ] as const,
};

// GET
const fetchViews = async () => {
  const response = await fetch(`${API_PATH}/insights/views`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw data;
  } else {
    return data;
  }
};

export const useViews = () => {
  return useQuery<IInsightsViews>({
    queryKey: viewKeys.lists(),
    queryFn: fetchViews,
  });
};
// CREATE

interface IInsightsViewObject {
  view: { data_sources: { origin_id: string }[]; name: string };
}

const createView = async (object: IInsightsViewObject) => {
  const response = await fetch(`${API_PATH}/insights/views`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(object),
  });
  const data = await response.json();
  if (!response.ok) {
    throw data;
  } else {
    return data;
  }
};

export const useCreateView = () => {
  const queryClient = useQueryClient();

  return useMutation<IInsightsView, CLErrors, IInsightsViewObject>({
    mutationFn: createView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
    },
  });
};
// UPDATE

// DELETE
const deleteView = async (id: string) => {
  const response = await fetch(`${API_PATH}/insights/views/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw data;
  } else {
    return data;
  }
};

export const useDeleteView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteView,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [viewKeys.lists()] });

      // Snapshot the previous value
      const previous = queryClient.getQueryData<IInsightsViews>(
        viewKeys.lists()
      );

      // Optimistically update to the new value
      queryClient.setQueryData(viewKeys.lists(), (old: IInsightsViews) => {
        const newData = {
          ...old,
          data: old.data.filter((item) => item.id !== id),
        };

        return newData;
      });

      // Return a context object with the snapshotted value
      return { previous };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previous) {
        queryClient.setQueryData<IInsightsViews>(
          viewKeys.lists(),
          context.previous
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
    },
  });
};
