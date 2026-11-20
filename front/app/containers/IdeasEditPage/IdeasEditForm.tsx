import React, { Suspense, useEffect, useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import EditIdeaHeading from 'containers/IdeaHeading/EditIdeaHeading';
import InputDetailView from 'containers/IdeasNewPage/SimilarInputs/InputDetailView';

import FormPageLayout from 'components/CustomFieldsForm/Page/FormPageLayout';
import { FORM_PAGE_CHANGE_EVENT } from 'components/CustomFieldsForm/PageControlButtons/events';

import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import eventEmitter from 'utils/eventEmitter';
import { useSearch } from 'utils/router';

import IdeasEditMeta from './IdeasEditMeta';
import messages from './messages';

const IdeationForm = React.lazy(
  () => import('components/CustomFieldsForm/IdeationForm')
);

interface Props {
  ideaId: string;
}

const IdeasEditForm = ({ ideaId }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const isSmallerThanPhone = useBreakpoint('phone');
  const searchParams = useSearch({
    from: '/$locale/ideas/edit/$ideaId',
  });
  const selectedIdeaId = searchParams.selected_idea_id;

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
        comment: messages.commentFormTitle,
        response: messages.responseFormTitle,
        suggestion: messages.suggestionFormTitle,
        topic: messages.topicFormTitle,
        post: messages.postFormTitle,
        story: messages.storyFormTitle,
        observation: messages.observationFormTitle,
      }[phase?.data.attributes.input_term || 'idea']}
    />
  );

  const handleCloseDetail = () => {
    updateSearchParams({ selected_idea_id: null });
  };

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
      {projectId && <IdeasEditMeta ideaId={ideaId} projectId={projectId} />}
      <FormPageLayout
        usingMapView={usingMapView}
        mainId="e2e-idea-edit-page"
        aside={aside}
        heading={
          idea &&
          projectId && (
            <EditIdeaHeading
              idea={idea.data}
              titleText={titleText}
              projectId={projectId}
              bordered={usingMapView}
            />
          )
        }
      >
        {project && (
          <Suspense>
            <IdeationForm
              projectId={project.data.id}
              phaseId={phaseId}
              participationMethod={phase?.data.attributes.participation_method}
              idea={idea?.data}
            />
          </Suspense>
        )}
      </FormPageLayout>
    </>
  );
};

export default IdeasEditForm;
