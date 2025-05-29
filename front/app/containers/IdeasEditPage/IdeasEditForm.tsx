import React, { useEffect, useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import EditIdeaHeading from 'containers/IdeaHeading/EditIdeaHeading';
import InputDetailView from 'containers/IdeasNewPage/SimilarInputs/InputDetailView';
import { calculateDynamicHeight } from 'containers/IdeasNewSurveyPage/IdeasNewSurveyForm/utils';

import CustomFieldsForm from 'components/CustomFieldsForm';
import { FORM_PAGE_CHANGE_EVENT } from 'components/Form/Components/Layouts/events';

import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import eventEmitter from 'utils/eventEmitter';

import IdeasEditMeta from './IdeasEditMeta';
import messages from './messages';

interface Props {
  ideaId: string;
}

const IdeasEditForm = ({ ideaId }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const isSmallerThanPhone = useBreakpoint('phone');
  const [searchParams] = useSearchParams();
  const selectedIdeaId = searchParams.get('selected_idea_id');

  const projectId = idea?.data.relationships.project.data.id;
  const [usingMapView, setUsingMapView] = useState(false);

  const phaseId = idea?.data.relationships.phases.data[0].id;
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);

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

  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;
  if (!tenantTimezone) return null;

  const titleText = (
    <FormattedMessage
      {...{
        idea: messages.formTitle,
        option: messages.optionFormTitle,
        project: messages.projectFormTitle,
        question: messages.questionFormTitle,
        issue: messages.issueFormTitle,
        contribution: messages.contributionFormTitle,
        initiative: messages.initiativeFormTitle,
        petition: messages.petitionFormTitle,
        proposal: messages.proposalFormTitle,
      }[phase?.data.attributes.input_term || 'idea']}
    />
  );
  const maxWidth = usingMapView ? '1100px' : '700px';

  const handleCloseDetail = () => {
    updateSearchParams({ selected_idea_id: null });
  };

  return (
    <>
      {projectId && <IdeasEditMeta ideaId={ideaId} projectId={projectId} />}
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
                {idea && projectId && (
                  <EditIdeaHeading
                    idea={idea.data}
                    titleText={titleText}
                    projectId={projectId}
                  />
                )}
              </Box>
              <main id="e2e-idea-edit-page">
                <Box
                  display="flex"
                  justifyContent="center"
                  pt={isSmallerThanPhone ? '0' : '40px'}
                >
                  <Box
                    background={colors.white}
                    maxWidth={usingMapView ? '1100px' : '700px'}
                    w="100%"
                    // Height is recalculated on window resize via useWindowSize hook
                    h={calculateDynamicHeight(isSmallerThanPhone)}
                    pb={isSmallerThanPhone ? '0' : '80px'}
                    overflowY="auto"
                  >
                    {project && (
                      <CustomFieldsForm
                        projectId={project.data.id}
                        phaseId={phaseId}
                        participationMethod={
                          phase?.data.attributes.participation_method
                        }
                        initialFormData={
                          idea && {
                            ...idea.data.attributes,
                            author_id: idea.data.relationships.author?.data?.id,
                          }
                        }
                      />
                    )}
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

export default IdeasEditForm;
