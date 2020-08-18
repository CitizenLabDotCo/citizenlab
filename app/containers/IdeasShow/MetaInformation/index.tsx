import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { colors, fontSizes } from 'cl2-component-library';

// components
// import Status from './Status';
import Location from './Location';
import Attachments from './Attachments';
// import Attachment from './Attachment';
import Topics from 'components/PostShowComponents/Topics';

// hooks
import useIdea from 'hooks/useIdea';
import useResourceFiles from 'hooks/useResourceFiles';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div`
  border-bottom: 1px solid ${colors.separation};
  padding-top: 25px;
  padding-bottom: 30px;
`;

const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  color: ${(props) => props.theme.colorText};
  margin-bottom: 15px;
`;

interface Props {
  ideaId: string;
}

const MetaInformation = ({ ideaId }: Props) => {
  const idea = useIdea({ ideaId });
  const files = useResourceFiles({ resourceType: 'idea', resourceId: ideaId });

  if (!isNilOrError(idea)) {
    const topicIds =
    idea.relationships.topics?.data.map(item => item.id) || [];
    const address = idea.attributes.location_description || null;
    const geoPosition = idea.attributes.location_point_geojson || null;

    const topicsEnabled = true; // to do
    // const topicsEnabled = this.isFieldEnabled(
    //   'topic_ids',
    //   ideaCustomFieldsSchemas,
    //   locale
    // );
    const locationEnabled = true; // to do
    // const locationEnabled = this.isFieldEnabled(
    //   'location',
    //   ideaCustomFieldsSchemas,
    //   locale
    // );
    const attachmentsEnabled = true; // to do
    // const attachmentsEnabled = this.isFieldEnabled(
    //   'attachments',
    //   ideaCustomFieldsSchemas,
    //   locale
    // );

    return (
      <Container>
        <Item>
          <Header>
            <FormattedMessage {...messages.currentStatus} />
          </Header>
        </Item>
        {topicsEnabled && topicIds.length > 0 &&
          <Item>
            <Header>
              <FormattedMessage {...messages.topics} />
            </Header>
            <Topics
              postType="idea"
              topicIds={topicIds}
            />
          </Item>
        }
        {locationEnabled && address && geoPosition &&
          <Item>
            <Header>
              <FormattedMessage {...messages.location} />
            </Header>
            <Location address={address} />
          </Item>
        }
        {attachmentsEnabled &&
          !isNilOrError(files) &&
          files.length > 0 &&
          <Item>
            <Header>
              <FormattedMessage {...messages.attachments} />
            </Header>
            <Attachments files={files} />
          </Item>
        }

        <Item>
          <Header>
            <FormattedMessage {...messages.similarIdeas} />
          </Header>
        </Item>
      </Container>
    );
  }

  return null;
};

export default MetaInformation;
