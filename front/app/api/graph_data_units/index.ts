import {
  AgeProps,
  AnalyticsProps,
  GenderProps,
  MostReactedIdeasProps,
  SingleIdeaProps,
  SurveyQuestionResultProps,
  VisitorsTrafficSourcesProps,
} from './requestTypes';
import {
  ActiveUsersResponse,
  CommentsByTimeResponse,
  MostReactedIdeasResponse,
  PostsByTimeResponse,
  ReactionsByTimeResponse,
  SingleIdeaResponse,
  SurveyQuestionResultResponse,
  UsersByAgeResponse,
  UsersByGenderResponse,
  VisitorsResponse,
  VisitorsTrafficSourcesResponse,
} from './responseTypes';
import useGraphDataUnits from './useGraphDataUnits';
import useGraphDataUnitsLive from './useGraphDataUnitsLive';

export const useSurveyQuestionResult = (props: SurveyQuestionResultProps) => {
  return useGraphDataUnits<SurveyQuestionResultResponse>({
    resolved_name: 'SurveyQuestionResultWidget',
    props,
  });
};

export const useMostReactedIdeas = (
  props: MostReactedIdeasProps,
  { enabled }: { enabled: boolean }
) => {
  return useGraphDataUnits<MostReactedIdeasResponse>(
    {
      resolved_name: 'MostReactedIdeasWidget',
      props,
    },
    { enabled }
  );
};

export const useSingleIdea = (
  props: SingleIdeaProps,
  { enabled }: { enabled: boolean }
) => {
  return useGraphDataUnits<SingleIdeaResponse>(
    {
      resolved_name: 'SingleIdeaWidget',
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
      resolved_name: 'VisitorsWidget',
      props,
    },
    { onSuccess }
  );
};

export const useVisitorsTrafficSources = (
  props: VisitorsTrafficSourcesProps
) => {
  return useGraphDataUnits<VisitorsTrafficSourcesResponse>({
    resolved_name: 'VisitorsTrafficSourcesWidget',
    props,
  });
};

export const useVisitorsTrafficSourcesLive = (
  props: VisitorsTrafficSourcesProps
) => {
  return useGraphDataUnitsLive<VisitorsTrafficSourcesResponse>({
    resolved_name: 'VisitorsTrafficSourcesWidget',
    props,
  });
};

export const useUsersByGender = (props: GenderProps) => {
  return useGraphDataUnits<UsersByGenderResponse>({
    resolved_name: 'GenderWidget',
    props,
  });
};

export const useUsersByGenderLive = (props: GenderProps) => {
  return useGraphDataUnitsLive<UsersByGenderResponse>({
    resolved_name: 'GenderWidget',
    props,
  });
};

export const useUsersByAge = (props: AgeProps) => {
  return useGraphDataUnits<UsersByAgeResponse>({
    resolved_name: 'AgeWidget',
    props,
  });
};

export const useUsersByAgeLive = (props: AgeProps) => {
  return useGraphDataUnitsLive<UsersByAgeResponse>({
    resolved_name: 'AgeWidget',
    props,
  });
};

export const useActiveUsers = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<ActiveUsersResponse>(
    {
      resolved_name: 'ActiveUsersWidget',
      props,
    },
    { onSuccess }
  );
};

export const usePostsByTime = (props: AnalyticsProps) => {
  return useGraphDataUnits<PostsByTimeResponse>({
    resolved_name: 'PostsByTimeWidget',
    props,
  });
};

export const usePostsByTimeLive = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<PostsByTimeResponse>(
    {
      resolved_name: 'PostsByTimeWidget',
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
      resolved_name: 'CommentsByTimeWidget',
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
      resolved_name: 'CommentsByTimeWidget',
      props,
    },
    { onSuccess }
  );
};

export const useReactionsByTime = (props: AnalyticsProps) => {
  return useGraphDataUnits<ReactionsByTimeResponse>({
    resolved_name: 'ReactionsByTimeWidget',
    props,
  });
};

export const useReactionsByTimeLive = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<ReactionsByTimeResponse>(
    {
      resolved_name: 'ReactionsByTimeWidget',
      props,
    },
    { onSuccess }
  );
};
