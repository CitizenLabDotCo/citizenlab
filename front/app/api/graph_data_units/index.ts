import {
  ActiveUsersResponse,
  CommentsByTimeResponse,
  PostsByTimeResponse,
  ReactionsByTimeResponse,
  UsersByBirthyearResponse,
  UsersByGenderResponse,
} from './responseTypes';
import { AgeProps, AnalyticsProps, GenderProps } from './requestTypes';
import useGraphDataUnits from './useGraphDataUnits';
import useGraphDataUnitsLive from './useGraphDataUnitsLive';

export const useUsersByGender = (props: GenderProps) => {
  return useGraphDataUnits<UsersByGenderResponse>({
    resolvedName: 'GenderWidget',
    props,
  });
};

export const useUsersByGenderLive = (props: GenderProps) => {
  return useGraphDataUnitsLive<UsersByGenderResponse>({
    resolvedName: 'GenderWidget',
    props,
  });
};

export const useUsersByAge = (props: AgeProps) => {
  return useGraphDataUnits<UsersByBirthyearResponse>({
    resolvedName: 'AgeWidget',
    props,
  });
};

export const useUsersByAgeLive = (props: AgeProps) => {
  return useGraphDataUnitsLive<UsersByBirthyearResponse>({
    resolvedName: 'AgeWidget',
    props,
  });
};

export const useActiveUsers = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<ActiveUsersResponse>(
    {
      resolvedName: 'ActiveUsersWidget',
      props,
    },
    { onSuccess }
  );
};

export const usePostsByTime = (props: AnalyticsProps) => {
  return useGraphDataUnits<PostsByTimeResponse>({
    resolvedName: 'PostsByTimeWidget',
    props,
  });
};

export const usePostsByTimeLive = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<PostsByTimeResponse>(
    {
      resolvedName: 'PostsByTimeWidget',
      props,
    },
    { onSuccess }
  );
};

export const useCommentsByTime = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<CommentsByTimeResponse>(
    {
      resolvedName: 'CommentsByTimeWidget',
      props,
    },
    { onSuccess }
  );
};

export const useCommentsByTimeLive = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<CommentsByTimeResponse>(
    {
      resolvedName: 'CommentsByTimeWidget',
      props,
    },
    { onSuccess }
  );
};

export const useReactionsByTime = (props: AnalyticsProps) => {
  return useGraphDataUnits<ReactionsByTimeResponse>({
    resolvedName: 'ReactionsByTimeWidget',
    props,
  });
};

export const useReactionsByTimeLive = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<ReactionsByTimeResponse>(
    {
      resolvedName: 'ReactionsByTimeWidget',
      props,
    },
    { onSuccess }
  );
};
