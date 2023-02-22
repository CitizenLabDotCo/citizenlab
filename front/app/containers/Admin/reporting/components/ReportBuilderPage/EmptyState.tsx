import React from 'react';

// images
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';

// components
import { Box, Image, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Tippy from '@tippyjs/react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// utils
import { isNilOrError } from 'utils/helperUtils';

const StyledBackgroundImage = styled(Image)`
  opacity: 0.5;
  width: 100%;
  height: 100%;
  position: absolute;
`;

interface Props {
  onOpenModal: () => void;
}

const EmptyState = ({ onOpenModal }: Props) => {
  const appConfig = useAppConfiguration();

  if (isNilOrError(appConfig)) {
    return null;
  }
  const isReportBuilderAllowed =
    appConfig.attributes.settings.report_builder?.allowed;

  return (
    <Box background="white" mb="36px" position="relative" height="460px">
      <StyledBackgroundImage alt="" src={EmptyProjectsImage} />
      <Box
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Title variant="h3" mb="0px">
            <FormattedMessage {...messages.emptyStateTitle} />
          </Title>
          <Text>
            <FormattedMessage {...messages.emptyStateDescription} />
          </Text>
          <Tippy
            maxWidth="250px"
            placement="right-start"
            content={<FormattedMessage {...messages.contactToAccess} />}
            hideOnClick={true}
            disabled={isReportBuilderAllowed}
          >
            <div>
              <Button
                mt="8px"
                py="6px"
                bgColor={colors.primary}
                onClick={onOpenModal}
                disabled={!isReportBuilderAllowed}
              >
                <FormattedMessage {...messages.emptyStateButtonText} />
              </Button>
            </div>
          </Tippy>
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
