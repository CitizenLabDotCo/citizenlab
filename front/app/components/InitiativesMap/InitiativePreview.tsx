import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';

// utils
import eventEmitter from 'utils/eventEmitter';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import T from 'components/T';
import Button from 'components/UI/Button';
import { Icon } from '@citizenlab/cl2-component-library';
import Body from 'components/PostShowComponents/Body';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.tenantText};
  width: calc(100% - 50px);
  margin: 0;
  padding: 0;
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  line-height: normal;

  ${media.phone`
    font-size: ${fontSizes.xl}px;
  `}
`;

const Address = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  margin-top: 20px;

  ${media.phone`
    font-size: ${fontSizes.s}px;
    margin-top: 18px;
  `}
`;

const MapMarkerIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 5px;
  margin-top: -2px;
`;

const Description = styled.div`
  flex: 0 1 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
  margin-top: 20px;

  &::after {
    background: linear-gradient(0deg, white, rgba(255, 255, 255, 0));
    bottom: 0;
    content: '';
    display: block;
    height: 3rem;
    left: 0;
    right: 0;
    position: absolute;
  }

  ${media.phone`
    margin-top: 18px;
  `}
`;

const Footer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 25px;
`;

const ViewInitiativeButton = styled(Button)`
  justify-self: flex-end;
`;

const CommentsCount = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  display: none;

  ${media.tablet`
    display: block;
  `}
`;

const CommentIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
  margin-top: 2px;
`;

interface InputProps {
  initiativeId?: string | null;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  initiative: GetInitiativeChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class InitiativePreview extends PureComponent<
  Props & InjectedLocalized,
  State
> {
  createInitiativeClickHandler = (event: React.MouseEvent) => {
    event.preventDefault();

    const { initiative } = this.props;

    if (!isNilOrError(initiative)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: initiative.id,
        slug: initiative.attributes.slug,
        type: 'initiative',
      });
    }
  };

  render() {
    const { initiative, locale, className, localize } = this.props;

    if (!isNilOrError(initiative)) {
      const initiativeAddress = get(
        initiative,
        'attributes.location_description'
      );
      const initiativeBody = localize(initiative.attributes.body_multiloc);

      return (
        <Container className={className}>
          <Title>
            <T value={initiative.attributes.title_multiloc} />
          </Title>

          {initiativeAddress && (
            <Address>
              <MapMarkerIcon name="position" />
              {initiativeAddress}
            </Address>
          )}

          <Description>
            <Body
              postId={initiative.id}
              postType="initiative"
              locale={locale}
              body={initiativeBody}
            />
          </Description>

          <Footer>
            <CommentsCount>
              <CommentIcon name="comments" />
              {initiative.attributes.comments_count}
            </CommentsCount>
          </Footer>

          <ViewInitiativeButton
            fullWidth={true}
            onClick={this.createInitiativeClickHandler}
          >
            <FormattedMessage {...messages.seeInitiative} />
          </ViewInitiativeButton>
        </Container>
      );
    }

    return null;
  }
}

const InitiativePreviewWithHOCs = injectLocalize<Props>(InitiativePreview);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <InitiativePreviewWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
