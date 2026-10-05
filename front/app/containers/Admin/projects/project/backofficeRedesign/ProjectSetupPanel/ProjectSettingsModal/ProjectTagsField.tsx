import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useGlobalTopics from 'api/global_topics/useGlobalTopics';

import useLocalize from 'hooks/useLocalize';

import TagPicker from 'components/UI/TagPicker';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import messages from '../../messages';

const HelperLink = typedStyled(Link)`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
  text-decoration: underline;
  }
`;

interface Props {
  selectedTopicIds: string[];
  onChange: (topicIds: string[]) => void;
}

const ProjectTagsField = ({ selectedTopicIds, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: topics } = useGlobalTopics({});

  if (!topics) return null;

  const options = topics.data.map((topic) => ({
    value: topic.id,
    label: localize(topic.attributes.title_multiloc),
  }));

  return (
    <Box>
      <Text variant="boSection" mt="0px" mb="4px">
        {formatMessage(messages.settingsTagsTitle)}
      </Text>
      <Text variant="boHelper" mt="0px" mb="12px">
        <FormattedMessage
          {...messages.settingsTagsDescription}
          values={{
            platformSettingsLink: (
              <HelperLink to="/admin/settings/topics">
                <FormattedMessage {...messages.settingsPlatformSettingsLink} />
              </HelperLink>
            ),
          }}
        />
      </Text>
      <TagPicker
        options={options}
        selected={selectedTopicIds}
        onChange={onChange}
      />
    </Box>
  );
};

export default ProjectTagsField;
