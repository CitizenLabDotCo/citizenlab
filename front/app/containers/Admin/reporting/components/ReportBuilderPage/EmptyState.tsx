import React from 'react';

import {
  Box,
  Image,
  Title,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';
import styled from 'styled-components';

import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import sharedMessages from '../../messages';

import messages from './messages';

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
  const isReportBuilderAllowed = useReportBuilderEnabled({
    onlyCheckAllowed: true,
  });

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
            <FormattedMessage {...messages.customizeReport} />
          </Text>
          <Tooltip
            maxWidth="250px"
            placement="right-start"
            content={<FormattedMessage {...sharedMessages.contactToAccess} />}
            hideOnClick
            disabled={isReportBuilderAllowed}
          >
            <div>
              <ButtonWithLink
                onClick={onOpenModal}
                icon="plus-circle"
                buttonStyle="admin-dark"
                disabled={!isReportBuilderAllowed}
                id="e2e-create-report-button"
              >
                <FormattedMessage {...messages.emptyStateButtonText} />
              </ButtonWithLink>
            </div>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
