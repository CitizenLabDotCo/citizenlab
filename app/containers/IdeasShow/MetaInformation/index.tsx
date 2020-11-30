import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import isFieldEnabled from '../isFieldEnabled';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div<{ isFirstItem?: boolean }>`
  border-top: ${({ isFirstItem }) =>
    isFirstItem ? `1px solid #e0e0e0` : 'none'};
  border-bottom: 1px solid #e0e0e0;
  padding-top: 20px;
  padding-bottom: 23px;
`;

const StyledPostedBy = styled(PostedBy)`
  margin-top: -4px;
`;

export const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  color: ${(props) => props.theme.colorText};
  padding: 0;
  margin: 0;
  margin-bottom: 12px;
`;

interface InputProps {
  className?: string;
  ideaId: string;
  authorId: string | null;
  projectId: string;
  statusId: string;
}

interface DataProps {
  similarIdeasEnabled: GetFeatureFlagChildProps;
}

interface Props extends InputProps, DataProps {}

const MetaInformation = ({
  className,
  ideaId,
  projectId,
  statusId,
  authorId,
  similarIdeasEnabled,
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
        <Item isFirstItem>
          <Header>
            <FormattedMessage {...messages.postedBy} />
          </Header>
          <StyledPostedBy authorId={authorId} ideaId={ideaId} />
        </Item>
        <Item>
          <Status statusId={statusId} />
        </Item>
        {topicsEnabled && (
          <Item>
            <IdeaTopics ideaId={ideaId} />
          </Item>
        )}
        {locationEnabled && (
          <Item>
            <Location projectId={projectId} ideaId={ideaId} />
          </Item>
        )}
        {attachmentsEnabled && (
          <Item>
            <Attachments ideaId={ideaId} />
          </Item>
        )}
        {similarIdeasEnabled && (
          <Item>
            <SimilarIdeas ideaId={ideaId} />
          </Item>
        )}
      </Container>
    );
  }

  return null;
};

const Data = adopt({
  similarIdeasEnabled: <GetFeatureFlag name="similar_ideas" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {({ similarIdeasEnabled }) => (
      <MetaInformation
        {...inputProps}
        similarIdeasEnabled={similarIdeasEnabled}
      />
    )}
  </Data>
);
