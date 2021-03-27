import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import isFieldEnabled from '../isFieldEnabled';

// components
import Status from './Status';
import Location from './Location';
import Attachments from './Attachments';
import IdeaTopics from './IdeaTopics';
import PostedBy from './PostedBy';

// hooks
import useLocale from 'hooks/useLocale';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import Outlet from 'components/Outlet';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledPostedBy = styled(PostedBy)`
  margin-top: -4px;
  margin-bottom: -6px;
`;

interface Props {
  className?: string;
  ideaId: string;
  authorId: string | null;
  projectId: string;
  statusId: string;
}

const MetaInformation = ({
  className,
  ideaId,
  projectId,
  statusId,
  authorId,
}: Props) => {
  const locale = useLocale();
  const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({ projectId });
  if (!isNilOrError(locale) && !isNilOrError(ideaCustomFieldsSchemas)) {
    const topicsEnabled = isFieldEnabled(
      'topic_ids',
      ideaCustomFieldsSchemas,
      locale
    );
    const locationEnabled = isFieldEnabled(
      'location',
      ideaCustomFieldsSchemas,
      locale
    );
    const attachmentsEnabled = isFieldEnabled(
      'attachments',
      ideaCustomFieldsSchemas,
      locale
    );

    return (
      <Container className={className}>
        <StyledPostedBy authorId={authorId} ideaId={ideaId} />
        <Status statusId={statusId} />
        {topicsEnabled && <IdeaTopics ideaId={ideaId} />}
        {locationEnabled && <Location projectId={projectId} ideaId={ideaId} />}
        {attachmentsEnabled && <Attachments ideaId={ideaId} />}
        <Outlet id="app.containers.IdeasShow.MetaInformation" ideaId={ideaId} />
      </Container>
    );
  }

  return null;
};

export default MetaInformation;
