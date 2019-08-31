import React, { memo } from 'react';

// components
import Icon from 'components/UI/Icon';
import LazyImage from 'components/LazyImage';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// intl
import messages from './messages';
import T from 'components/T';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// data
import { adopt } from 'react-adopt';
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';

interface InputProps {
  location: string;
  pageSlug: string;
  imageUrl: string;
}
interface DataProps {
  page: GetPageChildProps;
}

interface Props extends InputProps, DataProps {}

const Container: any = styled(Link)`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  flex: 1;
  padding: 18px 20px;
  &:not(:last-child) {
    margin-right: 20px;
  }
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.05);

  ${media.biggerThanMinTablet`
    transition: all 200ms ease;

    &:hover, &:focus {
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12);
      transform: translate(0px, -2px);
    }
  `}
`;

const LocationIcon = styled(Icon)`
  height: 20px;
  margin-right: 7px;
`;

const LocationIndication = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  color: white;
  background: rgba(0, 0, 0, 0.75);
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 7px 10px;
`;

const SuccessIndication = styled.span`
  color: white;
  background: ${colors.clGreen};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 4px 7px;
  text-transform: uppercase;
  font-weight: 600;
  width: auto;
`;

const SuccessTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.large}px;
  margin-bottom: 15px;
  margin-top: 20px;
`;

const SuccessImageContainer = styled.div`
  width: 100%;
  height: 150px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 150px;
  display: flex;
  margin-right: 10px;
  margin-bottom: 25px;
  overflow: hidden;
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius};
  ${media.smallerThanMaxTablet`
    height: 100px;
  `}
`;

const SuccessImagePlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.placeholderBg};
`;

const SuccessImagePlaceholderIcon = styled(Icon) `
  height: 45px;
  fill: #fff;
`;

const SuccessImage = styled(LazyImage)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
`;

const SuccessCard = memo(({ page, imageUrl, pageSlug, location, intl: { formatMessage } }: Props & InjectedIntlProps) => {
  if (isNilOrError(page)) return null;

  return (
    <Container to={`/pages/${pageSlug}`} target="_blank">
      <SuccessImageContainer>
        <SuccessImagePlaceholder>
          <SuccessImagePlaceholderIcon name="successStory" />
        </SuccessImagePlaceholder>

        <LocationIndication>
          <LocationIcon name="position" />
          {location}
        </LocationIndication>

        {imageUrl &&
          <T value={page.attributes.title_multiloc}>
            {storyTitle => (
              <SuccessImage
                src={imageUrl}
                alt={formatMessage(messages.successImageAltText, { storyTitle })}
                cover={true}
              />
            )}
          </T>
        }
      </SuccessImageContainer>
      <SuccessIndication>
        <FormattedMessage {...messages.success}/>
      </SuccessIndication>
      <SuccessTitle>
        <T value={page.attributes.title_multiloc} />
      </SuccessTitle>
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  page: ({ pageSlug, render }) => <GetPage slug={pageSlug}>{render}</GetPage>,
});

const SuccessCardWithIntl = injectIntl(SuccessCard);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <SuccessCardWithIntl {...inputProps} {...dataprops} />}
  </Data>
);
