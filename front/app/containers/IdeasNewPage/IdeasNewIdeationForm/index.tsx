import React, { Suspense, useEffect, useRef, useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IPhases, IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useOnQuerySuccess from 'hooks/useOnQuerySuccess';

import NewIdeaHeading from 'containers/IdeaHeading/NewIdeaHeading';
import InputDetailView from 'containers/IdeasNewPage/SimilarInputs/InputDetailView';

import FormPageLayout from 'components/CustomFieldsForm/Page/FormPageLayout';
import { FORM_PAGE_CHANGE_EVENT } from 'components/CustomFieldsForm/PageControlButtons/events';

import { customerAnalyticsEvents, trackEventByName } from 'utils/analytics';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import eventEmitter from 'utils/eventEmitter';
import { useSearch } from 'utils/router';

import IdeasNewMeta from '../IdeasNewMeta';

const IdeationForm = React.lazy(
  () => import('components/CustomFieldsForm/IdeationForm')
);

const getConfig = (
  phaseFromUrl: IPhaseData | undefined,
  phases: IPhases | undefined
) => {
  const participationMethod = phaseFromUrl
    ? phaseFromUrl.attributes.participation_method
    : getCurrentPhase(phases?.data)?.attributes.participation_method;

  if (!participationMethod) return;
  return getMethodConfig(participationMethod);
};

interface Props {
  project: IProject;
  phaseId: string | undefined;
  participationMethod?: ParticipationMethod;
}

const IdeasNewIdeationForm = ({
  project,
  phaseId,
  participationMethod,
}: Props) => {
  const { data: phases } = usePhases(project.data.id);
  const phaseQuery = usePhase(phaseId);
  const { data: phase } = phaseQuery;
  const isSmallerThanPhone = useBreakpoint('phone');
  const [usingMapView, setUsingMapView] = useState(false);
  const searchParams = useSearch({
    from: '/$locale/projects/$slug/ideas/new',
  });
  const selectedIdeaId = searchParams.selected_idea_id;
  const participationMethodConfig = getConfig(phase?.data, phases);

  const hasTrackedStart = useRef(false);
  useOnQuerySuccess(phaseQuery, () => {
    if (hasTrackedStart.current || !phase) return;
    hasTrackedStart.current = true;

    trackEventByName(customerAnalyticsEvents.ideaStarted, {
      project_id: project.data.id,
      phase_id: phase.data.id,
      participation_method: phase.data.attributes.participation_method,
    });
  });

  const handleCloseDetail = () => {
    updateSearchParams({ selected_idea_id: null });
  };

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(FORM_PAGE_CHANGE_EVENT)
      .subscribe(() => {
        setUsingMapView(!!document.getElementById('map_page'));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!participationMethodConfig || !phase) {
    return null;
  }

  const titleText = participationMethodConfig.getFormTitle?.({
    project: project.data,
    phases: phases?.data,
    phaseFromUrl: phase.data,
  });
  const aside =
    selectedIdeaId &&
    (isSmallerThanPhone ? (
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="rgba(0,0,0,0.4)"
        zIndex="2000"
        onClick={handleCloseDetail}
      >
        <Box
          as="aside"
          position="absolute"
          bottom="0"
          width="100%"
          height="75%"
          bgColor={colors.white}
          borderRadius="16px 16px 0 0"
          overflowY="auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            width="40px"
            height="4px"
            bgColor={colors.grey300}
            borderRadius="2px"
            m="8px auto"
          />
          <InputDetailView
            ideaId={selectedIdeaId}
            onClose={handleCloseDetail}
          />
        </Box>
      </Box>
    ) : (
      <Box
        as="aside"
        width="375px"
        minWidth="375px"
        borderLeft={`1px solid ${colors.grey300}`}
        overflowY="auto"
        bgColor={colors.white}
        {...(usingMapView
          ? { position: 'relative', top: '40px', mb: '80px' }
          : { position: 'sticky', top: '0', h: '100vh' })}
      >
        <InputDetailView ideaId={selectedIdeaId} onClose={handleCloseDetail} />
      </Box>
    ));

  return (
    <>
      <IdeasNewMeta />
      <FormPageLayout
        usingMapView={usingMapView}
        mainId="e2e-idea-new-page"
        aside={aside}
        heading={
          phaseId && (
            <NewIdeaHeading
              phase={phase.data}
              titleText={titleText}
              bordered={usingMapView}
            />
          )
        }
      >
        <Suspense>
          <IdeationForm
            projectId={project.data.id}
            phaseId={phaseId}
            participationMethod={participationMethod}
          />
        </Suspense>
      </FormPageLayout>
    </>
  );
};

export default IdeasNewIdeationForm;
