import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import useLocale from 'hooks/useLocale';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// assets
import insights from '../../../assets/insightsView.png';
import messages from '../messages';

// components
import { Button, Box } from '@citizenlab/cl2-component-library';
import { InjectedIntlProps } from 'react-intl';

const Container = styled.div`
  background-color: ${colors.adminContentBackground};
  padding: 135px 100px;
  display: flex;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
`;

const Title = styled.h1`
  padding-top: 30px;
  .accent {
    color: ${colors.clBlueLight};
  }
`;

const Description = styled.p`
  padding-top: 10px;
  font-size: ${fontSizes.base}px;
  color: ${colors.label};
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
        <Title>
          <FormattedMessage
            {...messages.emptyStateTitle}
            values={{
              accentText: (
                <span className="accent">
                  {formatMessage(messages.emptyStateAccentText)}
                </span>
              ),
            }}
          />
        </Title>
        <Description>{formatMessage(messages.description)}</Description>
        {!isNilOrError(locale) && (
          <Box display="flex" flexWrap="wrap" alignItems="flex-start" mt="40px">
            <Button
              locale={locale}
              bgColor={colors.adminTextColor}
              onClick={openCreateModal}
              mr="12px"
              mb="12px"
            >
              {formatMessage(messages.emptyStateCreate)}
            </Button>
            <Button
              locale={locale}
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
