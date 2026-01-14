import React from 'react';

import { Box, CardButton, Text } from '@citizenlab/cl2-component-library';

import { IdeationMethod } from 'api/phases/types';

import { SubSectionTitle } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import ForumViewIcon from './CardIcons/ForumViewIcon';
import SensemakingViewIcon from './CardIcons/SensemakingViewIcon';
import messages from './messages';

type IdeationMethodSelectorProps = {
  ideation_method?: IdeationMethod | null;
  handleIdeationMethodOnChange: (ideation_method: IdeationMethod) => void;
};

const IdeationMethodSelector = ({
  ideation_method,
  handleIdeationMethodOnChange,
}: IdeationMethodSelectorProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="35px" width="800px">
      <SubSectionTitle>
        {formatMessage(messages.ideationMethodSelectorTitle)}
      </SubSectionTitle>
      <Box display="flex" gap="16px">
        <CardButton
          selected={ideation_method === 'base'}
          icon={<ForumViewIcon selected={ideation_method === 'base'} />}
          onClick={(e) => {
            e.preventDefault();
            handleIdeationMethodOnChange('base');
          }}
          title={formatMessage(messages.forumViewTitle)}
          subtitle={
            <>
              <Text as="span" fontSize="s">
                {formatMessage(messages.forumViewDescription)}
              </Text>
              <Text as="span" display="block" mt="8px" mb="0px" fontSize="s">
                {formatMessage(messages.forumViewBestFor)}
              </Text>
            </>
          }
        />
        <CardButton
          selected={ideation_method === 'idea_feed'}
          icon={
            <SensemakingViewIcon selected={ideation_method === 'idea_feed'} />
          }
          onClick={(e) => {
            e.preventDefault();
            handleIdeationMethodOnChange('idea_feed');
          }}
          title={formatMessage(messages.sensemakingViewTitle)}
          subtitle={
            <>
              <Text as="span" fontSize="s">
                {formatMessage(messages.sensemakingViewDescription)}
              </Text>
              <Text as="span" display="block" mt="8px" mb="0px" fontSize="s">
                {formatMessage(messages.sensemakingViewBestFor)}
              </Text>
            </>
          }
        />
      </Box>
    </Box>
  );
};

export default IdeationMethodSelector;
