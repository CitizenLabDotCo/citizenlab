import React, { PureComponent } from 'react';
import { get, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import Sharing from 'components/Sharing';
import InitiativeMeta from './InitiativeMeta';
import Modal from 'components/UI/Modal';
import FileAttachments from 'components/UI/FileAttachments';
import SharingModalContent from 'components/PostComponents/sharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import Topics from 'components/PostComponents/Topics';
import Title from 'components/PostComponents/Title';
import LoadableDropdownMap from 'components/PostComponents/DropdownMap/LoadableDropdownMap';
import Body from 'components/PostComponents/Body';
import ContentFooter from 'components/PostComponents/ContentFooter';

import PostedBy from './PostedBy';
import PostedByMobile from './PostedByMobile';
import Image from 'components/PostComponents/Image';
import Footer from 'components/PostComponents/Footer';
import Spinner from 'components/UI/Spinner';
import OfficialFeedback from 'components/PostComponents/OfficialFeedback';
import ActionBar from './ActionBar';
import TranslateButton from 'components/PostComponents/TranslateButton';
import VoteControl from 'containers/InitiativesShow/VoteControl';
import InitiativeMoreActions from './ActionBar/InitiativeMoreActions';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiativeImages, { GetInitiativeImagesChildProps } from 'resources/GetInitiativeImages';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, postPageContentMaxWidth, viewportWidths } from 'utils/styleUtils';
import { columnsGapDesktop, rightColumnWidthDesktop, columnsGapTablet, rightColumnWidthTablet } from './styleConstants';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Loading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px);
  background: #fff;
  opacity: 0;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}

  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing} ${contentFadeInDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }
`;

const InitiativeContainer = styled.div`
  width: 100%;
  max-width: ${postPageContentMaxWidth};
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 60px;
  padding-left: 60px;
  padding-right: 60px;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-top: 35px;
  `}

  ${media.smallerThanMinTablet`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Content = styled.div`
  width: 100%;
  display: flex;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const LeftColumn = styled.div`
  flex: 2;
  margin: 0;
  padding: 0;
  padding-right: ${columnsGapDesktop}px;

  ${media.tablet`
    padding-right: ${columnsGapTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const StyledTranslateButtonMobile = styled(TranslateButton)`
  display: none;
  width: fit-content;
  margin-bottom: 40px;

  ${media.smallerThanMinTablet`
    display: block;
  `}
`;

const InitiativeHeader = styled.div`
  margin-top: -5px;
  margin-bottom: 28px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
    margin-bottom: 45px;
  `}
`;

// const StyledMobileIdeaPostedBy = styled(IdeaPostedBy)`
//   margin-top: 4px;

//   ${media.biggerThanMaxTablet`
//     display: none;
//   `}
// `;

const InitiativeBannerContainer = styled.div`
  width: 100%;
  height: 163px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 40px;
  padding-bottom: 40px;
  position: relative;
  z-index: 3;
  background: #767676;

  ${media.smallerThanMinTablet`
    min-height: 200px;
  `}
`;

const InitiativeBannerImage = styled.div<{ src: string | null }>`
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -2;
`;

const InitiativeHeaderOverlay = styled.div`
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
`;

const NotOnDesktop = styled.div`
  ${media.biggerThanMinTablet`
    display: none;
  `}
`;

const OnlyOnDesktop = styled.div`
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const MobileMoreActionContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const StyledLoadableDropdownMap = styled(LoadableDropdownMap)`
  margin-bottom: 40px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 20px;
  `}
`;

const RightColumn = styled.div`
  flex: 1;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = styled(RightColumn)`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;

  ${media.tablet`
    flex: 0 0 ${rightColumnWidthTablet}px;
    width: ${rightColumnWidthTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MetaContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SharingMobile = styled(Sharing)`
  padding: 0;
  margin: 0;
  margin-top: 40px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

interface DataProps {
  initiative: GetInitiativeChildProps;
  locale: GetLocaleChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  initiativeFiles: GetResourceFilesChildProps;
  authUser: GetAuthUserChildProps;
  windowSize: GetWindowSizeChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
  tenant: GetTenantChildProps;
}

interface InputProps {
  initiativeId: string | null;
  inModal?: boolean | undefined;
  className?: string;
}

interface Props extends DataProps, InputProps { }

interface State {
  loaded: boolean;
  spamModalVisible: boolean;
  initiativeIdForSocialSharing: string | null;
  translateButtonClicked: boolean;
}

export class InitiativesShow extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & WithRouterProps, State> {
  initialState: State;

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      spamModalVisible: false,
      initiativeIdForSocialSharing: null,
      translateButtonClicked: false,
    };
  }

  componentDidMount() {
    const newInitiativeId = get(this.props.location.query, 'new_initiative_id');

    this.setLoaded();

    if (newInitiativeId) {
      setTimeout(() => {
        this.setState({ initiativeIdForSocialSharing: newInitiativeId });
      }, 1500);

      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  componentDidUpdate() {
    this.setLoaded();
  }

  setLoaded = () => {
    const { loaded } = this.state;
    const { initiative, initiativeImages, officialFeedbacks } = this.props;

    if (!loaded && !isNilOrError(initiative) && !isUndefined(initiativeImages) && !isUndefined(officialFeedbacks.officialFeedbacksList)) {
      this.setState({ loaded: true });
    }
  }

  closeInitiativeSocialSharingModal = () => {
    this.setState({ initiativeIdForSocialSharing: null });
  }

  onTranslateInitiative = () => {
    this.setState(prevState => {
      // analytics
      if (prevState.translateButtonClicked === true) {
        trackEvent(tracks.clickGoBackToOriginalInitiativeCopyButton);
      } else if (prevState.translateButtonClicked === false) {
        trackEvent(tracks.clickTranslateInitiativeButton);
      }

      return ({
        translateButtonClicked: !prevState.translateButtonClicked
      });
    });
  }

  render() {
    const {
      initiativeFiles,
      locale,
      initiative,
      localize,
      initiativeImages,
      authUser,
      windowSize,
      className,
      postOfficialFeedbackPermission,
      tenant
    } = this.props;
    const { loaded, initiativeIdForSocialSharing, translateButtonClicked } = this.state;
    const { formatMessage } = this.props.intl;
    let content: JSX.Element | null = null;
    const initiativeSettings = !isNilOrError(tenant) ? tenant.attributes.settings.initiatives : null;

    if (initiativeSettings && !isNilOrError(initiative) && !isNilOrError(locale) && loaded) {
      const initiativeHeaderImageLarge = (initiative.attributes.header_bg.large || null);
      const votingThreshold = initiativeSettings.voting_threshold;
      const daysLimit = initiativeSettings.days_limit;
      const authorId: string | null = get(initiative, 'relationships.author.data.id', null);
      const initiativeCreatedAt = initiative.attributes.created_at;
      const titleMultiloc = initiative.attributes.title_multiloc;
      const initiativeTitle = localize(titleMultiloc);
      const initiativeImageLarge: string | null = get(initiativeImages, '[0].attributes.versions.large', null);
      const initiativeGeoPosition = (initiative.attributes.location_point_geojson || null);
      const initiativeAddress = (initiative.attributes.location_description || null);
      const topicIds = (initiative.relationships.topics.data ? initiative.relationships.topics.data.map(item => item.id) : []);
      const initiativeUrl = location.href;
      const initiativeId = initiative.id;
      const initiativeBody = localize(initiative.attributes.body_multiloc);
      const biggerThanLargeTablet = windowSize ? windowSize > viewportWidths.largeTablet : false;
      const smallerThanLargeTablet = windowSize ? windowSize <= viewportWidths.largeTablet : false;
      const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;
      const utmParams = !isNilOrError(authUser) ? {
        source: 'share_initiative',
        campaign: 'share_content',
        content: authUser.id
      } : {
        source: 'share_initiative',
        campaign: 'share_content'
      };
      const showTranslateButton = (
        !isNilOrError(initiative) &&
        !isNilOrError(locale) &&
        !initiative.attributes.title_multiloc[locale]
      );

      content = (
        <>
          <InitiativeMeta initiativeId={initiativeId} />

          <InitiativeBannerContainer>
            <InitiativeBannerImage src={initiativeHeaderImageLarge} />
            <NotOnDesktop>
              <InitiativeHeaderOverlay />
              <MobileMoreActionContainer>
                <InitiativeMoreActions
                  initiative={initiative}
                  id="e2e-initiative-more-actions-mobile"
                  color="white"
                  tooltipPosition="bottom-left"
                />
              </MobileMoreActionContainer>
              <Title
                id={initiativeId}
                context="initiative"
                title={initiativeTitle}
                locale={locale}
                translateButtonClicked={translateButtonClicked}
                color="white"
                align="left"
              />
              <PostedByMobile
                authorId={authorId}
              />
            </NotOnDesktop>
          </InitiativeBannerContainer>

          <OnlyOnDesktop>
            <ActionBar
              initiativeId={initiativeId}
              translateButtonClicked={translateButtonClicked}
              onTranslateInitiative={this.onTranslateInitiative}
            />
          </OnlyOnDesktop>

          <NotOnDesktop>
            <VoteControl initiativeId={initiativeId} />
          </NotOnDesktop>

          <InitiativeContainer>
            <FeatureFlag name="machine_translations">
              {showTranslateButton && smallerThanSmallTablet &&
                <StyledTranslateButtonMobile
                  translateButtonClicked={translateButtonClicked}
                  onClick={this.onTranslateInitiative}
                />
              }
            </FeatureFlag>

            <Content>
              <LeftColumn>
                <Topics topicIds={topicIds} />

                <OnlyOnDesktop>
                  <InitiativeHeader>
                    <Title
                      id={initiativeId}
                      context="initiative"
                      title={initiativeTitle}
                      locale={locale}
                      translateButtonClicked={translateButtonClicked}
                    />

                    {/* {smallerThanLargeTablet &&
                      <StyledMobileIdeaPostedBy authorId={authorId} />
                    } */}
                  </InitiativeHeader>
                </OnlyOnDesktop>

                {biggerThanLargeTablet &&
                  <PostedBy
                    authorId={authorId}
                  />
                }

                {initiativeImageLarge &&
                  <Image
                    src={initiativeImageLarge}
                    postType="initiative"
                    className="e2e-initiativeImage"
                  />
                }

                {initiativeGeoPosition && initiativeAddress &&
                  <StyledLoadableDropdownMap
                    address={initiativeAddress}
                    position={initiativeGeoPosition}
                  />
                }

                <Body
                  id={initiativeId}
                  postType="initiative"
                  locale={locale}
                  body={initiativeBody}
                  translateButtonClicked={translateButtonClicked}
                />

                {!isNilOrError(initiativeFiles) && initiativeFiles.length > 0 &&
                  <FileAttachments files={initiativeFiles} />
                }

                <StyledOfficialFeedback
                  postId={initiativeId}
                  postType="initiative"
                  permissionToPost={postOfficialFeedbackPermission}
                />

                <ContentFooter
                  postType="initiative"
                  id={initiativeId}
                  createdAt={initiativeCreatedAt}
                  commentsCount={initiative.attributes.comments_count}
                />

                {smallerThanLargeTablet &&
                  <SharingMobile
                    context="initiative"
                    url={initiativeUrl}
                    twitterMessage={formatMessage(messages.twitterMessage, { initiativeTitle })}
                    emailSubject={formatMessage(messages.emailSharingSubject, { initiativeTitle })}
                    emailBody={formatMessage(messages.emailSharingBody, { initiativeUrl, initiativeTitle })}
                    utmParams={utmParams}
                  />
                }
              </LeftColumn>

              {biggerThanLargeTablet &&
                <RightColumnDesktop>
                  <MetaContent>
                    <VoteControl initiativeId={initiative.id} />
                    <SharingWrapper>
                      <Sharing
                        context="initiative"
                        url={initiativeUrl}
                        twitterMessage={formatMessage(messages.twitterMessage, { initiativeTitle })}
                        emailSubject={formatMessage(messages.emailSharingSubject, { initiativeTitle })}
                        emailBody={formatMessage(messages.emailSharingBody, { initiativeUrl, initiativeTitle })}
                        utmParams={utmParams}
                      />
                    </SharingWrapper>
                  </MetaContent>
                </RightColumnDesktop>
              }
            </Content>
          </InitiativeContainer>

          {/* {loaded && <Footer postId={initiativeId} postType="initiative" />} */}
        </>
      );

      return (
        <>
          {!loaded &&
            <Loading>
              <Spinner />
            </Loading>
          }

          <CSSTransition
            classNames="content"
            in={loaded}
            timeout={{
              enter: contentFadeInDuration + contentFadeInDelay,
              exit: 0
            }}
            enter={true}
            exit={false}
          >
            <Container id="e2e-initiative-show" className={className}>
              {content}
            </Container>
          </CSSTransition>

          <FeatureFlag name="initiativeflow_social_sharing">
            <Modal
              opened={!!initiativeIdForSocialSharing}
              close={this.closeInitiativeSocialSharingModal}
              hasSkipButton={true}
              skipText={<FormattedMessage {...messages.skipSharing} />}
              label={formatMessage(messages.modalShareLabel)}
            >
              {initiativeIdForSocialSharing &&
                <SharingModalContent
                  postType="initiative"
                  postId={initiativeIdForSocialSharing}
                  title={formatMessage(messages.shareTitle)}
                  subtitle={formatMessage(messages.shareSubtitle, { votingThreshold, daysLimit })}
                />
              }
            </Modal>
          </FeatureFlag>
        </>
      );
    }

    return null;
  }
}

const InitiativesShowWithHOCs = injectLocalize<Props>(injectIntl(withRouter(InitiativesShow)));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
  windowSize: <GetWindowSize debounce={50} />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  initiativeImages: ({ initiativeId, render }) => <GetInitiativeImages initiativeId={initiativeId}>{render}</GetInitiativeImages>,
  initiativeFiles: ({ initiativeId, render }) => <GetResourceFiles resourceId={initiativeId} resourceType="initiative">{render}</GetResourceFiles>,
  officialFeedbacks: ({ initiativeId, render }) => <GetOfficialFeedbacks postId={initiativeId} postType="initiative">{render}</GetOfficialFeedbacks>,
  postOfficialFeedbackPermission: ({ initiative, render }) => !isNilOrError(initiative) ? <GetPermission item={initiative} action="moderate" >{render}</GetPermission> : null,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
