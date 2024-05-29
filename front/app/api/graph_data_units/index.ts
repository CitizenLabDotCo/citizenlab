// Props
import {
  ActiveUsersProps,
  BaseDemographicsProps,
  AnalyticsProps,
  MostReactedIdeasProps,
  SingleIdeaProps,
  SurveyQuestionResultProps,
  VisitorsProps,
  VisitorsTrafficSourcesProps,
  DemographicsProps,
  RegistrationsProps,
} from './requestTypes';
// Response types
import {
  UsersByAgeResponse,
  UsersByGenderResponse,
} from './responseTypes/_deprecated';
import { ActiveUsersResponse } from './responseTypes/ActiveUsersWidget';
import { CommentsByTimeResponse } from './responseTypes/CommentsByTimeWidget';
import { DemographicsResponse } from './responseTypes/DemographicsWidget';
import { MostReactedIdeasResponse } from './responseTypes/MostReactedIdeasWidget';
import { PostsByTimeResponse } from './responseTypes/PostsByTimeWidget';
import { ReactionsByTimeResponse } from './responseTypes/ReactionsByTimeWidget';
import { RegistrationsResponse } from './responseTypes/RegistrationsWidget';
import { SingleIdeaResponse } from './responseTypes/SingleIdeaWidget';
import { SurveyQuestionResultResponse } from './responseTypes/SurveyQuestionResultWidget';
import { VisitorsTrafficSourcesResponse } from './responseTypes/VisitorsTrafficSourcesWidget';
import { VisitorsResponse } from './responseTypes/VisitorsWidget';
// Hooks
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
  props: VisitorsProps,
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

export const useVisitorsLive = (
  props: VisitorsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<VisitorsResponse>(
    {
      resolved_name: 'VisitorsWidget',
      props,
    },
    {
      onSuccess,
    }
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

export const useDemographics = ({
  custom_field_id,
  ...props
}: DemographicsProps) => {
  return useGraphDataUnits<DemographicsResponse>(
    {
      resolved_name: 'DemographicsWidget',
      props: { custom_field_id, ...props },
    },
    { enabled: !!custom_field_id }
  );
};

export const useUsersByGender = (props: BaseDemographicsProps) => {
  return useGraphDataUnits<UsersByGenderResponse>({
    resolved_name: 'GenderWidget',
    props,
  });
};

export const useUsersByGenderLive = (props: BaseDemographicsProps) => {
  return useGraphDataUnitsLive<UsersByGenderResponse>({
    resolved_name: 'GenderWidget',
    props,
  });
};

export const useUsersByAge = (props: BaseDemographicsProps) => {
  return useGraphDataUnits<UsersByAgeResponse>({
    resolved_name: 'AgeWidget',
    props,
  });
};

export const useUsersByAgeLive = (props: BaseDemographicsProps) => {
  return useGraphDataUnitsLive<UsersByAgeResponse>({
    resolved_name: 'AgeWidget',
    props,
  });
};

export const useActiveUsers = (
  props: ActiveUsersProps,
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

export const useActiveUsersLive = (
  props: ActiveUsersProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<ActiveUsersResponse>(
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

export const useRegistrations = (
  props: RegistrationsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<RegistrationsResponse>(
    {
      resolved_name: 'RegistrationsWidget',
      props,
    },
    { onSuccess }
  );
};

export const useRegistrationsLive = (
  props: RegistrationsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<RegistrationsResponse>(
    {
      resolved_name: 'RegistrationsWidget',
      props,
    },
    { onSuccess }
  );
};
