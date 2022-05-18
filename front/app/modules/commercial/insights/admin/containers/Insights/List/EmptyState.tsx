import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import useLocale from 'hooks/useLocale';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// assets
import insights from '../../../assets/insightsView.png';
import messages from '../messages';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { InjectedIntlProps } from 'react-intl';

const Container = styled.div`
  background-color: ${colors.adminContentBackground};
  padding: 135px 100px;
  display: flex;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
`;

const Image = styled.img`
  width: 50%;
  margin-left: 35px;
  object-fit: contain;
  ${media.smallerThanMaxTablet`
    display: none;
  `};
`;

interface Props {
  openCreateModal: () => void;
}

const EmptyState = ({
  openCreateModal,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const locale = useLocale();

  return (
    <Container data-testid="insightsListEmptyState">
      <div>
        <Title variant="h1">
          <FormattedMessage
            {...messages.emptyStateTitle}
            values={{
              accentText: (
                <span style={{ color: colors.clBlueLight }}>
                  {formatMessage(messages.emptyStateAccentText)}
                </span>
              ),
            }}
          />
        </Title>
        <Text pt="10px" fontSize="base" color="label">
          {formatMessage(messages.description)}
        </Text>
        {!isNilOrError(locale) && (
          <Box display="flex" flexWrap="wrap" alignItems="flex-start" mt="40px">
            <Button
              bgColor={colors.adminTextColor}
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
        )}
      </div>
      <Image src={insights} />
    </Container>
  );
};

export default injectIntl(EmptyState);
