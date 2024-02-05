import {
  AgeProps,
  AnalyticsProps,
  GenderProps,
  MostReactedIdeasProps,
  SurveyResultsProps,
  SurveyQuestionResultProps,
  VisitorsTrafficSourcesProps,
} from './requestTypes';
import {
  ActiveUsersResponse,
  CommentsByTimeResponse,
  MostReactedIdeasResponse,
  PostsByTimeResponse,
  ReactionsByTimeResponse,
  SurveyResultsResponse,
  SurveyQuestionResultResponse,
  UsersByBirthyearResponse,
  UsersByGenderResponse,
  VisitorsResponse,
  VisitorsTrafficSourcesResponse,
} from './responseTypes';
import useGraphDataUnits from './useGraphDataUnits';
import useGraphDataUnitsLive from './useGraphDataUnitsLive';

export const useSurveyResults = (props: SurveyResultsProps) => {
  return useGraphDataUnits<SurveyResultsResponse>({
    resolvedName: 'SurveyResultsWidget',
    props,
  });
};

export const useSurveyQuestionResult = (props: SurveyQuestionResultProps) => {
  return useGraphDataUnits<SurveyQuestionResultResponse>({
    resolvedName: 'SurveyQuestionResultWidget',
    props,
  });
};

export const useMostReactedIdeas = (
  props: MostReactedIdeasProps,
  { enabled }: { enabled: boolean }
) => {
  return useGraphDataUnits<MostReactedIdeasResponse>(
    {
      resolvedName: 'MostReactedIdeasWidget',
      props,
    },
    { enabled }
  );
};

export const useVisitors = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<VisitorsResponse>(
    {
      resolvedName: 'VisitorsWidget',
      props,
    },
    { onSuccess }
  );
};

export const useVisitorsTrafficSources = (
  props: VisitorsTrafficSourcesProps
) => {
  return useGraphDataUnits<VisitorsTrafficSourcesResponse>({
    resolvedName: 'VisitorsTrafficSourcesWidget',
    props,
  });
};

export const useVisitorsTrafficSourcesLive = (
  props: VisitorsTrafficSourcesProps
) => {
  return useGraphDataUnitsLive<VisitorsTrafficSourcesResponse>({
    resolvedName: 'VisitorsTrafficSourcesWidget',
    props,
  });
};

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
