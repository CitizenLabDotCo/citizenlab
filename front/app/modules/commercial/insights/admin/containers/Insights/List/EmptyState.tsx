import React from 'react';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// assets
import insights from '../../../assets/insightsView.png';
import messages from '../messages';

// components
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { WrappedComponentProps } from 'react-intl';

const Container = styled.div`
  background-color: ${colors.white};
  padding: 135px 100px;
  display: flex;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
`;

const Image = styled.img`
  width: 50%;
  margin-left: 35px;
  object-fit: contain;
  ${media.tablet`
    display: none;
  `};
`;

interface Props {
  openCreateModal: () => void;
}

const EmptyState = ({
  openCreateModal,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  return (
    <Container data-testid="insightsListEmptyState">
      <div>
        <Title variant="h1">
          <FormattedMessage
            {...messages.emptyStateTitle}
            values={{
              accentText: (
                <span style={{ color: colors.teal300 }}>
                  {formatMessage(messages.emptyStateAccentText)}
                </span>
              ),
            }}
          />
        </Title>
        <Text pt="10px" fontSize="base" color="textSecondary">
          {formatMessage(messages.description)}
        </Text>
        <Box display="flex" flexWrap="wrap" alignItems="flex-start" mt="40px">
          <Button
            className="intercom-admin-create-insights-button"
            bgColor={colors.primary}
            onClick={openCreateModal}
            mr="12px"
            mb="12px"
          >
            {formatMessage(messages.emptyStateCreate)}
          </Button>
          <Button
            buttonStyle="secondary"
            linkTo={formatMessage(messages.supportLinkUrl)}
            openLinkInNewTab
          >
            {formatMessage(messages.emptyStateDiscover)}
          </Button>
        </Box>
      </div>
      <Image src={insights} />
    </Container>
  );
};

export default injectIntl(EmptyState);
