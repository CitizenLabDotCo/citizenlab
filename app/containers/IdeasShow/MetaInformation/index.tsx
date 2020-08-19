import React from 'react';
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
// import Attachment from './Attachment';
import Topics from 'components/PostShowComponents/Topics';
import FeatureFlag from 'components/FeatureFlag';
import SimilarIdeas from './SimilarIdeas';

// hooks
import useIdea from 'hooks/useIdea';
import useResourceFiles from 'hooks/useResourceFiles';
import useLocale from 'hooks/useLocale';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import useSimilarIdeas from 'hooks/useSimilarIdeas';
import useIdeaStatus from 'hooks/useIdeaStatus';

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
  projectId: string;
  statusId: string;
}

const MetaInformation = ({ ideaId, projectId, statusId }: Props) => {
  const idea = useIdea({ ideaId });
  const files = useResourceFiles({ resourceType: 'idea', resourceId: ideaId });
  const locale = useLocale();
  const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({ projectId });
  const similarIdeas = useSimilarIdeas({ ideaId, pageSize: 5 });
  const ideaStatus = useIdeaStatus({ statusId });

  if (!isNilOrError(idea) && !isNilOrError(locale) && !isNilOrError(ideaCustomFieldsSchemas)) {
    const topicIds =
    idea.relationships.topics?.data.map(item => item.id) || [];
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

    return (
      <Container>
        {!isNilOrError(ideaStatus) &&
          <Item>
            <Header>
              <FormattedMessage {...messages.currentStatus} />
            </Header>
            <Status ideaStatus={ideaStatus} />
          </Item>
        }
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
        {/* <FeatureFlag name="similar_ideas"> */}
          {!isNilOrError(similarIdeas) &&
            <Item>
              <Header>
                <FormattedMessage {...messages.similarIdeas} />
              </Header>
              <SimilarIdeas similarIdeas={similarIdeas} />
            </Item>
          }
        {/* </FeatureFlag> */}
      </Container>
    );
  }

  return null;
};

export default MetaInformation;
