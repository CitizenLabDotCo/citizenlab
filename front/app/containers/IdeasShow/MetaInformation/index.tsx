import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { checkFieldEnabled } from '../isFieldEnabled';

// components
import Status from './Status';
import Location from './Location';
import Attachments from './Attachments';
import IdeaTopics from './IdeaTopics';
import PostedBy from './PostedBy';

// hooks & services
import useLocale from 'hooks/useLocale';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import Outlet from 'components/Outlet';
import useFeatureFlag from 'hooks/useFeatureFlag';

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

  const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({
    projectId,
    ideaId,
  });
  const ideaCustomFieldsIsEnabled = useFeatureFlag({
    name: 'idea_custom_fields',
  });
  const dynamicIdeaFormIsEnabled = useFeatureFlag({
    name: 'dynamic_idea_form',
  });

  if (!isNilOrError(locale) && !isNilOrError(ideaCustomFieldsSchemas)) {
    const topicsEnabled = checkFieldEnabled(
      'topic_ids',
      ideaCustomFieldsSchemas,
      locale,
      ideaCustomFieldsIsEnabled,
      dynamicIdeaFormIsEnabled
    );

    const locationEnabled = checkFieldEnabled(
      'location_description',
      ideaCustomFieldsSchemas,
      locale,
      ideaCustomFieldsIsEnabled,
      dynamicIdeaFormIsEnabled
    );

    const attachmentsEnabled = checkFieldEnabled(
      'idea_files_attributes',
      ideaCustomFieldsSchemas,
      locale,
      ideaCustomFieldsIsEnabled,
      dynamicIdeaFormIsEnabled
    );

    return (
      <Container className={`${className || ''} ${compact ? 'compact' : ''}`}>
        <PostedBy authorId={authorId} ideaId={ideaId} compact={compact} />
        <Status statusId={statusId} compact={compact} />
        {topicsEnabled && <IdeaTopics ideaId={ideaId} compact={compact} />}
        {locationEnabled && (
          <Location projectId={projectId} ideaId={ideaId} compact={compact} />
        )}
        {attachmentsEnabled && (
          <Attachments ideaId={ideaId} compact={compact} />
        )}
        <Outlet
          id="app.containers.IdeasShow.MetaInformation"
          ideaId={ideaId}
          compact={compact}
        />
      </Container>
    );
  }

  return null;
};

export default MetaInformation;
