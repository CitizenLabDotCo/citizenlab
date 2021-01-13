import React, { memo } from 'react';

// components
import { Icon } from 'cl2-component-library';
import Image from 'components/UI/Image';

// style
import styled from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
} from 'utils/styleUtils';

// intl
import messages from './messages';
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';

// data
import { adopt } from 'react-adopt';
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';

const Container: any = styled(Link)`
  flex: 1;
  padding: 18px 20px;
  ${defaultCardStyle};

  &:not(:last-child) {
    margin-right: 20px;
  }

  ${media.biggerThanMinTablet`
    ${defaultCardHoverStyle};
  `}
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

const LocationIcon = styled(Icon)`
  height: 20px;
  width: 20px;
  margin-right: 7px;
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

const SuccessTitle = styled.h3`
  color: ${({ theme }) => theme.colorText};
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

const SuccessImagePlaceholderIcon = styled(Icon)`
  height: 45px;
  fill: #fff;
`;

const SuccessImage = styled(Image)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

interface InputProps {
  location: string;
  pageSlug: string;
  imageUrl: string;
}

interface DataProps {
  page: GetPageChildProps;
}

interface Props extends InputProps, DataProps {}

const SuccessCard = memo(({ page, imageUrl, pageSlug, location }: Props) => {
  if (isNilOrError(page)) return null;

  return (
    <Container to={`/pages/${pageSlug}`}>
      <SuccessImageContainer>
        <SuccessImagePlaceholder>
          <SuccessImagePlaceholderIcon name="successStory" />
        </SuccessImagePlaceholder>

        <LocationIndication>
          <LocationIcon name="position" />
          {location}
        </LocationIndication>

        {imageUrl && <SuccessImage src={imageUrl} alt="" cover={true} />}
      </SuccessImageContainer>
      <SuccessIndication>
        <FormattedMessage {...messages.success} />
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

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <SuccessCard {...inputProps} {...dataprops} />}
  </Data>
);
