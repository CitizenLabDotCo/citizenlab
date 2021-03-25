import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import isFieldEnabled from '../isFieldEnabled';

// styles
import { fontSizes } from 'utils/styleUtils';

// components
import Status from './Status';
import Location from './Location';
import Attachments from './Attachments';
import IdeaTopics from './IdeaTopics';
import SimilarIdeas from './SimilarIdeas';
import PostedBy from './PostedBy';

// hooks
import useLocale from 'hooks/useLocale';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import useFeatureFlag from 'hooks/useFeatureFlag';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const Item = styled.div<{ isFirstItem?: boolean }>`
  border-top: ${({ isFirstItem }) =>
    isFirstItem ? `1px solid #e0e0e0` : 'none'};
  border-bottom: 1px solid #e0e0e0;
  padding-top: 18px;
  padding-bottom: 21px;
`;

const StyledPostedBy = styled(PostedBy)`
  margin-top: -4px;
  margin-bottom: -6px;
`;

export const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  color: ${(props) => props.theme.colorText};
  padding: 0;
  margin: 0;
  margin-bottom: 12px;
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
  const similarIdeasEnabled = useFeatureFlag('similar_ideas');
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
        {similarIdeasEnabled && <SimilarIdeas ideaId={ideaId} />}
      </Container>
    );
  }

  return null;
};

export default MetaInformation;
