import React from 'react';
import {
  Box,
  Text,
  Title,
  Badge,
  colors,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import workshopsImage from './workshops.png';
import widgetImage from './widget.png';
import apiImage from './apIllustration.png';

export const ToolsPage = () => {
  const { formatMessage } = useIntl();

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Box maxWidth="800px">
        <Title>{formatMessage(messages.tools)}</Title>

        <Box>
          <Box background={colors.white} display="flex" p="20px">
            <Box w="320px" h="240px">
              <img
                src={workshopsImage}
                alt={formatMessage(messages.workshopsImage)}
              />
            </Box>

            <Box ml="32px" display="flex" flexDirection="column">
              <Text variant="bodyL">
                {formatMessage(messages.workshopsTitle)}
              </Text>
              <Text>{formatMessage(messages.workshopsDescription)}</Text>
              <Box display="flex" width="100%" alignItems="center">
                <Button
                  height="45px"
                  icon="arrow-right"
                  iconColor={colors.white}
                  iconPos="right"
                >
                  <Text color="white">
                    {formatMessage(messages.manageWorkshops)}
                  </Text>
                </Button>
                <Text ml="26px">{formatMessage(messages.learnMore)}</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box my="20px" width="100%">
          <Box background={colors.white} display="flex" p="20px">
            <Box
              px="40px"
              w="320px"
              h="240px"
              background="#7FBBCA"
              display="flex"
              alignItems="flex-end"
              justifyContent="center"
            >
              <img
                src={widgetImage}
                alt={formatMessage(messages.widgetImage)}
              />
            </Box>
            <Box ml="32px" display="flex" flexDirection="column">
              <Text variant="bodyL">{formatMessage(messages.widgetTitle)}</Text>
              <Text>{formatMessage(messages.widgetDescription)}</Text>
              <Button
                height="45px"
                icon="arrow-right"
                iconColor={colors.white}
                iconPos="right"
                width="fit-content"
              >
                <Text color="white">
                  {formatMessage(messages.manageWidget)}
                </Text>
              </Button>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box background={colors.white} display="flex" p="20px">
            <Box w="320px" h="240px">
              <img
                src={apiImage}
                alt={formatMessage(messages.publicAPIImage)}
              />
            </Box>
            <Box ml="32px" display="flex" flexDirection="column">
              <Box width="fit-content">
                <Badge className="inverse" color={colors.coolGrey300}>
                  {formatMessage(messages.comingSoon)}
                </Badge>
              </Box>
              <Text variant="bodyL">
                {formatMessage(messages.publicAPITitle)}
              </Text>
              <Text>{formatMessage(messages.publicAPIDescription)}</Text>
              <Button
                height="45px"
                icon="arrow-right"
                iconColor={colors.white}
                iconPos="right"
                width="fit-content"
              >
                <Text color="white">
                  {formatMessage(messages.managePublicAPIKeys)}
                </Text>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ToolsPage;
