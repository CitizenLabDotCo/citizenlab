import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import isFieldEnabled from '../isFieldEnabled';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { colors, fontSizes } from 'cl2-component-library';

// components
import Status from './Status';
import Location from './Location';
import Attachments from './Attachments';
import Topics from 'components/PostShowComponents/Topics';
import SimilarIdeas from './SimilarIdeas';

// hooks
import useIdea from 'hooks/useIdea';
import useResourceFiles from 'hooks/useResourceFiles';
import useLocale from 'hooks/useLocale';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import useSimilarIdeas from 'hooks/useSimilarIdeas';
import useIdeaStatus from 'hooks/useIdeaStatus';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div<{ isLastItem: boolean }>`
  border-bottom: ${({ isLastItem }) =>
    !isLastItem ? `1px solid ${colors.separation}` : 'none'};
  padding-top: 25px;
  padding-bottom: 30px;
`;

const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  color: ${(props) => props.theme.colorText};
  margin-bottom: 15px;
`;

interface InputProps {
  ideaId: string;
  projectId: string;
  statusId: string;
}

interface DataProps {
  similarIdeasEnabled: GetFeatureFlagChildProps;
}

interface Props extends InputProps, DataProps {}

const MetaInformation = ({
  ideaId,
  projectId,
  statusId,
  similarIdeasEnabled,
}: Props) => {
  const idea = useIdea({ ideaId });
  const files = useResourceFiles({ resourceType: 'idea', resourceId: ideaId });
  const locale = useLocale();
  const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({ projectId });
  const similarIdeas = useSimilarIdeas({ ideaId, pageSize: 5 });
  const ideaStatus = useIdeaStatus({ statusId });

  if (
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !isNilOrError(ideaCustomFieldsSchemas)
  ) {
    const topicIds =
      idea.relationships.topics?.data.map((item) => item.id) || [];
    const address = idea.attributes.location_description || null;
    const geoPosition = idea.attributes.location_point_geojson || null;

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

    const calculateLastItem = () => {
      if (similarIdeasEnabled && !isNilOrError(similarIdeas)) {
        return 'similarIdeas';
      } else if (
        attachmentsEnabled &&
        !isNilOrError(files) &&
        files.length > 0
      ) {
        return 'attachments';
      } else if (locationEnabled && address && geoPosition) {
        return 'location';
      } else if (topicsEnabled && topicIds.length > 0) {
        return 'topics';
      } else {
        return 'ideaStatus';
      }
    };

    const lastItem = calculateLastItem();

    return (
      <Container>
        {!isNilOrError(ideaStatus) && (
          <Item isLastItem={lastItem === 'ideaStatus'}>
            <Header>
              <FormattedMessage {...messages.currentStatus} />
            </Header>
            <Status ideaStatus={ideaStatus} />
          </Item>
        )}
        {topicsEnabled && topicIds.length > 0 && (
          <Item isLastItem={lastItem === 'topics'}>
            <Header>
              <FormattedMessage {...messages.topics} />
            </Header>
            <Topics postType="idea" topicIds={topicIds} />
          </Item>
        )}
        {locationEnabled && address && geoPosition && (
          <Item isLastItem={lastItem === 'location'}>
            <Header>
              <FormattedMessage {...messages.location} />
            </Header>
            <Location
              position={geoPosition}
              address={address}
              projectId={projectId}
            />
          </Item>
        )}
        {attachmentsEnabled && !isNilOrError(files) && files.length > 0 && (
          <Item isLastItem={lastItem === 'attachments'}>
            <Header>
              <FormattedMessage {...messages.attachments} />
            </Header>
            <Attachments files={files} />
          </Item>
        )}
        {similarIdeasEnabled && !isNilOrError(similarIdeas) && (
          <Item isLastItem={lastItem === 'similarIdeas'}>
            <Header>
              <FormattedMessage {...messages.similarIdeas} />
            </Header>
            <SimilarIdeas similarIdeas={similarIdeas} />
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
