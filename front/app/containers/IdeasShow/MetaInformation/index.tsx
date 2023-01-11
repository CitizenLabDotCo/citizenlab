import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// components
import Status from './Status';
import Location from './Location';
import Attachments from './Attachments';
import IdeaTopics from './IdeaTopics';
import PostedBy from './PostedBy';

// hooks & services
import useLocale from 'hooks/useLocale';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';

// utils
import { isFieldEnabled } from 'utils/projectUtils';

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
    inputId: ideaId,
  });

  if (!isNilOrError(locale) && !isNilOrError(ideaCustomFieldsSchemas)) {
    const topicsEnabled = isFieldEnabled(
      'topic_ids',
      ideaCustomFieldsSchemas,
      locale
    );

    const locationEnabled = isFieldEnabled(
      'location_description',
      ideaCustomFieldsSchemas,
      locale
    );

    const attachmentsEnabled = isFieldEnabled(
      'idea_files_attributes',
      ideaCustomFieldsSchemas,
      locale
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
      </Container>
    );
  }

  return null;
};

export default MetaInformation;
