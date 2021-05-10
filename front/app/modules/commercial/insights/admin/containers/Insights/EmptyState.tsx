import React from 'react';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import useLocale from 'hooks/useLocale';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// assets
import insights from '../../assets/insights.png';
import messages from '../../../messages';

// components
import { Button } from 'cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  background-color: ${colors.adminContentBackground};
  padding: 135px 100px;
  display: flex;
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
`;

const Image = styled.img`
  width: 50%;
  margin-left: 35px;
  object-fit: contain;
  ${media.smallerThanMaxTablet`
    display: none;
  `};
`;

const ButtonsContainer = styled.div`
  display: flex;
  > *:first-child {
    margin-right: 12px;
  }
`;

const EmptyState = ({ intl: { formatMessage } }) => {
  const locale = useLocale();
  console.log(colors);
  return (
    <Container>
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
        <Description>{formatMessage(messages.insightsDescription)}</Description>
        {!isNilOrError(locale) && (
          <ButtonsContainer>
            <Button locale={locale} bgColor={colors.adminTextColor}>
              {formatMessage(messages.emptyStateCreate)}
            </Button>
            <Button
              locale={locale}
              bgColor={colors.lightGreyishBlue}
              textColor={colors.adminTextColor}
            >
              {formatMessage(messages.emptyStateDiscover)}
            </Button>
          </ButtonsContainer>
        )}
      </div>
      <Image src={insights} />
    </Container>
  );
};

export default injectIntl(EmptyState);
