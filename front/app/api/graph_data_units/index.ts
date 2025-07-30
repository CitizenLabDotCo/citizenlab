// Props
import {
  ParticipantsProps,
  AnalyticsProps,
  MostReactedIdeasProps,
  SingleIdeaProps,
  SurveyQuestionResultProps,
  VisitorsProps,
  VisitorsTrafficSourcesProps,
  DemographicsProps,
  RegistrationsProps,
  MethodsUsedProps,
  ParticipationProps,
  ProjectsProps,
  DeviceTypesProps,
  VisitorsLanguagesProps,
} from './requestTypes';
// Response types
import { DemographicsResponse } from './responseTypes/DemographicsWidget';
import { DeviceTypesResponse } from './responseTypes/DeviceTypesWidget';
import { MethodsUsedResponse } from './responseTypes/MethodsUsedWidget';
import { MostReactedIdeasResponse } from './responseTypes/MostReactedIdeasWidget';
import { ParticipantsResponse } from './responseTypes/ParticipantsWidget';
import { ParticipationResponse } from './responseTypes/ParticipationWidget';
import { ProjectsResponse } from './responseTypes/ProjectsWidget';
import { ReactionsByTimeResponse } from './responseTypes/ReactionsByTimeWidget';
import { RegistrationsResponse } from './responseTypes/RegistrationsWidget';
import { SingleIdeaResponse } from './responseTypes/SingleIdeaWidget';
import { SurveyQuestionResultResponse } from './responseTypes/SurveyQuestionResultWidget';
import { VisitorsLanguagesResponse } from './responseTypes/VisitorsLanguagesWidget';
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

export const useVisitorsLanguagesLive = (props: VisitorsLanguagesProps) => {
  return useGraphDataUnitsLive<VisitorsLanguagesResponse>({
    resolved_name: 'VisitorsLanguagesWidget',
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

export const useDemographicsLive = (props: DemographicsProps) => {
  return useGraphDataUnitsLive<DemographicsResponse>({
    resolved_name: 'DemographicsWidget',
    props,
  });
};

export const useParticipants = (
  props: ParticipantsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<ParticipantsResponse>(
    {
      resolved_name: 'ParticipantsWidget',
      props,
    },
    { onSuccess }
  );
};

export const useParticipantsLive = (
  props: ParticipantsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<ParticipantsResponse>(
    {
      resolved_name: 'ParticipantsWidget',
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

export const useMethodsUsed = (props: MethodsUsedProps = {}) => {
  return useGraphDataUnits<MethodsUsedResponse>({
    resolved_name: 'MethodsUsedWidget',
    props,
  });
};

export const useParticipation = (
  props: ParticipationProps = {},
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<ParticipationResponse>(
    {
      resolved_name: 'ParticipationWidget',
      props,
    },
    { onSuccess }
  );
};

export const useParticipationLive = (
  props: ParticipationProps = {},
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnitsLive<ParticipationResponse>(
    {
      resolved_name: 'ParticipationWidget',
      props,
    },
    { onSuccess }
  );
};

export const useProjects = (props: ProjectsProps = {}) => {
  return useGraphDataUnits<ProjectsResponse>({
    resolved_name: 'ProjectsWidget',
    props,
  });
};

export const useDeviceTypesLive = (props: DeviceTypesProps) => {
  return useGraphDataUnitsLive<DeviceTypesResponse>({
    resolved_name: 'DeviceTypesWidget',
    props,
  });
};
