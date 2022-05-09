import React from 'react';

// images
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { StyledBackgroundImage } from '../../containers/Dashboard/EmptyState';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

interface Props {
  titleMultiloc: Multiloc;
}

const EmptyCard = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      position="relative"
      width="100%"
      height="444px"
      background="white"
      mb="36px"
    >
      <StyledBackgroundImage alt="" src={EmptyProjectsImage} />
      <Box
        p="20px 40px 32px 40px"
        height="100%"
        display="flex"
        flexDirection="column"
      >
        <Box flex="0 1 auto">
          <Title variant="h3" as="h2" mb="28px">
            {localize(titleMultiloc)}
          </Title>
        </Box>

        <Box
          flex="1 1 auto"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Title variant="h3" mb="8px" color="text">
            <FormattedMessage {...messages.provideBaseDataset} />
          </Title>
          <Text mt="0px">
            <FormattedMessage {...messages.baseDatasetExplanation} />
          </Text>
          <Button width="164px" bgColor={colors.adminTextColor}>
            <FormattedMessage {...messages.submitBaseDataButton} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyCard;
