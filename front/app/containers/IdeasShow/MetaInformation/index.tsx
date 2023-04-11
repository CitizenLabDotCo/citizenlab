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
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import Outlet from 'components/Outlet';

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
  const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
    projectId,
    inputId: ideaId,
  });

  if (!isNilOrError(locale) && !isNilOrError(ideaCustomFieldsSchema)) {
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
