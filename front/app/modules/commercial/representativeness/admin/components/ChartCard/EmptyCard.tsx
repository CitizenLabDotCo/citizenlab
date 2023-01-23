import React from 'react';

// images
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import {
  Box,
  Title,
  Text,
  StatusLabel,
} from '@citizenlab/cl2-component-library';
import { StyledBackgroundImage } from '../../containers/Dashboard/EmptyState';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const StyledStatusLabel = styled(StatusLabel)`
  margin-left: 8px;
  transform: translateY(-4px);
  height: 22px;
  font-weight: 700;
`;

interface Props {
  titleMultiloc: Multiloc;
  isComingSoon: boolean;
}

const EmptyCard = ({ titleMultiloc, isComingSoon }: Props) => {
  const localize = useLocalize();
  const title = localize(titleMultiloc);

  return (
    <Box position="relative" height="444px" background="white" mb="36px">
      <StyledBackgroundImage alt="" src={EmptyProjectsImage} />
      <Box
        p="20px 40px 32px 40px"
        height="100%"
        display="flex"
        flexDirection="column"
      >
        <Box flex="0 1 auto">
          <Title variant="h3" as="h2" mb="28px">
            {title}

            {isComingSoon && (
              <StyledStatusLabel
                text={<FormattedMessage {...messages.comingSoon} />}
                backgroundColor={colors.textSecondary}
              />
            )}
          </Title>
        </Box>

        <Box
          flex="1 1 auto"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Title variant="h3" mb="8px" color="textPrimary">
            {isComingSoon ? (
              <FormattedMessage {...messages.comingSoon} />
            ) : (
              <FormattedMessage {...messages.provideBaseDataset} />
            )}
          </Title>
          <Text mt="0px">
            {isComingSoon ? (
              <FormattedMessage
                {...messages.comingSoonDescription}
                values={{ fieldName: title.toLowerCase() }}
              />
            ) : (
              <FormattedMessage {...messages.baseDatasetExplanation} />
            )}
          </Text>
          {!isComingSoon && (
            <Button
              width="164px"
              bgColor={colors.primary}
              linkTo="/admin/dashboard/representation/edit-base-data"
            >
              <FormattedMessage {...messages.submitBaseDataButton} />
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyCard;
