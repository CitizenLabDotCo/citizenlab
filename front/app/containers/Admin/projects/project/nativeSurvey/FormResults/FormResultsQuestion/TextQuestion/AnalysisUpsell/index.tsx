import React from 'react';
import {
  Box,
  Icon,
  Text,
  Title,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import Tippy from '@tippyjs/react';

const AnalysisUpsell = () => {
  const { formatMessage } = useIntl();
  return (
    <Box px="20px">
      <Icon name="flash" width="40px" height="40px" fill={colors.primary} />
      <Title as="h3">{formatMessage(messages.title)}</Title>
      <ul>
        <Text as="li" color="textSecondary">
          {formatMessage(messages.bullet1)}
        </Text>
        <Text as="li" color="textSecondary">
          {formatMessage(messages.bullet2)}
        </Text>
        <Text as="li" color="textSecondary">
          {formatMessage(messages.bullet3)}
        </Text>
        <Text as="li" color="textSecondary">
          <FormattedMessage
            {...messages.bullet4}
            values={{
              link: (
                <a
                  href={formatMessage(messages.supportArticleLink)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatMessage(messages.supportArticle)}
                </a>
              ),
            }}
          />
        </Text>
      </ul>

      <Tippy
        content={<p>{formatMessage(messages.upsellMessage)}</p>}
        placement="auto-start"
      >
        <Box display="flex" w="auto">
          <Button buttonStyle="secondary" icon="lock">
            {formatMessage(messages.button)}
          </Button>
        </Box>
      </Tippy>
    </Box>
  );
};

export default AnalysisUpsell;
