import React, { useEffect, useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { IPhases, IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import NewIdeaHeading from 'containers/IdeaHeading/NewIdeaHeading';
import InputDetailView from 'containers/IdeasNewPage/SimilarInputs/InputDetailView';
import { calculateDynamicHeight } from 'containers/IdeasNewSurveyPage/IdeasNewSurveyForm/utils';

import CustomFieldsForm from 'components/CustomFieldsForm';
import { FORM_PAGE_CHANGE_EVENT } from 'components/Form/Components/Layouts/events';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import eventEmitter from 'utils/eventEmitter';

import IdeasNewMeta from '../IdeasNewMeta';

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
  const { data: phaseFromUrl } = usePhase(phaseId);
  const isSmallerThanPhone = useBreakpoint('phone');
  const [usingMapView, setUsingMapView] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedIdeaId = searchParams.get('selected_idea_id');
  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);

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

  if (!participationMethodConfig) {
    return null;
  }

  const titleText = participationMethodConfig.getFormTitle?.({
    project: project.data,
    phases: phases?.data,
    phaseFromUrl: phaseFromUrl?.data,
  });
  const maxWidth = usingMapView ? '1100px' : '700px';

  return (
    <>
      <IdeasNewMeta />
      <Box
        w="100%"
        bgColor={colors.grey100}
        h="100vh"
        position="fixed"
        zIndex="1010"
        overflow="hidden"
      >
        <Box display="flex" flexDirection="row" h="100%" w="100%">
          <Box
            flex="1"
            display="flex"
            mx="auto"
            justifyContent="center"
            w="100%"
          >
            <Box w="100%" maxWidth={maxWidth}>
              <Box
                w="100%"
                position="relative"
                top={isSmallerThanPhone ? '0' : '40px'}
              >
                {phaseId && (
                  <NewIdeaHeading phaseId={phaseId} titleText={titleText} />
                )}
              </Box>
              <main id="e2e-idea-new-page">
                <Box
                  display="flex"
                  justifyContent="center"
                  pt={isSmallerThanPhone ? '0' : '40px'}
                  w="100%"
                >
                  <Box
                    background={colors.white}
                    maxWidth={maxWidth}
                    w="100%"
                    h={calculateDynamicHeight(isSmallerThanPhone)}
                    pb={isSmallerThanPhone ? '0' : '80px'}
                    display="flex"
                  >
                    <CustomFieldsForm
                      projectId={project.data.id}
                      phaseId={phaseId}
                      participationMethod={participationMethod}
                    />
                  </Box>
                </Box>
              </main>
            </Box>

            {selectedIdeaId &&
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
                    <InputDetailView ideaId={selectedIdeaId} />
                  </Box>
                </Box>
              ) : (
                <Box
                  top="40px"
                  width="375px"
                  minWidth="375px"
                  borderLeft={`1px solid ${colors.grey300}`}
                  overflowY="auto"
                  bgColor={colors.white}
                  position="relative"
                  mb="80px"
                >
                  <InputDetailView ideaId={selectedIdeaId} />
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default IdeasNewIdeationForm;
