import React from 'react';

import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import { isFieldEnabled } from 'utils/projectUtils';

import Attachments from './Attachments';
import IdeaTopics from './IdeaTopics';
import Location from './Location';
import PostedBy from './PostedBy';
import SimilarIdeas from './SimilarIdeas';
import Status from './Status';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-top: solid 1px #ccc;
  border-bottom: solid 1px #ccc;
`;

interface Props {
  ideaId: string;
  authorId: string | null;
  projectId: string;
  statusId: string;
  compact?: boolean;
  className?: string;
}

const MetaInformation = ({
  ideaId,
  projectId,
  statusId,
  authorId,
  compact,
  className,
}: Props) => {
  const locale = useLocale();
  const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
    projectId,
    inputId: ideaId,
  });
  const { data: phases } = usePhases(projectId);
  const { data: idea } = useIdeaById(ideaId);

  const participationContext = getCurrentPhase(phases?.data);

  const { data: appConfig } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const similarIdeasEnabled =
    useFeatureFlag({ name: 'similar_inputs' }) &&
    (!appConfig?.data.attributes.settings.similar_inputs?.admins_only ||
      isAdmin(authUser));

  if (!isNilOrError(locale) && ideaCustomFieldsSchema && idea) {
    const { anonymous } = idea.data.attributes;
    const hideAuthor =
      participationContext?.attributes.participation_method === 'voting';
    const isProposal =
      participationContext?.attributes.participation_method === 'proposals';

    const topicsEnabled = isFieldEnabled(
      'topic_ids',
      ideaCustomFieldsSchema.data.attributes,
      locale
    );

    const locationEnabled = isFieldEnabled(
      'location_description',
      ideaCustomFieldsSchema.data.attributes,
      locale
    );

    const attachmentsEnabled = isFieldEnabled(
      'idea_files_attributes',
      ideaCustomFieldsSchema.data.attributes,
      locale
    );

    return (
      <Container className={`${className || ''} ${compact ? 'compact' : ''}`}>
        {!hideAuthor && (
          <>
            <PostedBy
              authorId={authorId}
              ideaId={ideaId}
              compact={compact}
              anonymous={anonymous}
            />
            {!isProposal && <Status statusId={statusId} compact={compact} />}
          </>
        )}
        {topicsEnabled && <IdeaTopics ideaId={ideaId} compact={compact} />}
        {locationEnabled && (
          <Location projectId={projectId} ideaId={ideaId} compact={compact} />
        )}
        {attachmentsEnabled && (
          <Attachments ideaId={ideaId} compact={compact} />
        )}
        {similarIdeasEnabled && <SimilarIdeas ideaId={ideaId} />}
      </Container>
    );
  }

  return null;
};

export default MetaInformation;
