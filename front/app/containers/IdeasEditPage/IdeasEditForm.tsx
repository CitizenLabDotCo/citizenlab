import React, { useEffect, useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IdeaPublicationStatus } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import EditIdeaHeading from 'containers/IdeaHeading/EditIdeaHeading';
import InputDetailView from 'containers/IdeasNewPage/SimilarInputs/InputDetailView';
import { calculateDynamicHeight } from 'containers/IdeasNewSurveyPage/IdeasNewSurveyForm/utils';

import CustomFieldsForm from 'components/CustomFieldsForm';
import { FORM_PAGE_CHANGE_EVENT } from 'components/Form/Components/Layouts/events';

import { FormattedMessage } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import IdeasEditMeta from './IdeasEditMeta';
import messages from './messages';

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  author_id?: string;
  idea_images_attributes?: { image: string }[];
  idea_files_attributes?: {
    file_by_content: { content: string };
    name: string;
  };
  location_description?: string;
  location_point_geojson?: GeoJSON.Point;
  topic_ids?: string[];
  cosponsor_ids?: string[];
  publication_status?: IdeaPublicationStatus;
}

interface Props {
  ideaId: string;
}

const IdeasEditForm = ({ ideaId }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const isSmallerThanPhone = useBreakpoint('phone');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | undefined>(
    undefined
  );

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
                        initialFormData={idea?.data.attributes}
                        setSelectedIdeaId={setSelectedIdeaId}
                      />
                    )}
                  </Box>
                </Box>
              </main>
            </Box>
            {selectedIdeaId && (
              <Box
                top={isSmallerThanPhone ? '0' : '40px'}
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
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default IdeasEditForm;
