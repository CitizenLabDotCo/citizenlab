import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { getInputTerm } from 'services/participationContexts';

// components
import SharingButtons from 'components/Sharing/SharingButtons';
import { Spinner } from 'cl2-component-library';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import { PostType } from 'resources/GetPost';

// i18n
import { InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import rocket from './rocket.png';

const Loading = styled.div`
  width: 100%;
  height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Rocket = styled.img`
  width: 40px;
  height: 40px;

  ${media.smallerThanMaxTablet`
    width: 35px;
    height: 35px;
  `}
`;

const Title = styled.h1`
  flex-shrink: 0;
  width: 100%;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 0;

  ${media.smallerThanMaxTablet`
    max-width: auto;
    font-size: ${fontSizes.xxxl}px;
    line-height: 36px;
  `}
`;

const Description = styled.p`
  flex-shrink: 0;
  width: 100%;
  max-width: 500px;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.large}px;
  line-height: 25px;
  font-weight: 300;
  text-align: center;
  margin: 0;
  margin-top: 10px;
  margin-bottom: 50px;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.base}px;
    line-height: 21px;
  `}
`;

const SharingWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
`;

interface InputProps {
  postType: PostType;
  postId: string | null;
  className?: string;
  title: string;
  subtitle: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  initiative: GetInitiativeChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class SharingModalContent extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized,
  State
> {
  componentDidMount() {
    const { postId, postType } = this.props;

    trackEventByName(tracks.sharingModalOpened.name, {
      postId,
      postType,
    });
  }

  getPostValues = () => {
    const { postType, idea, initiative, localize, locale } = this.props;
    let postTitle: string | null = null;
    let postUrl: string | null = null;

    if (postType === 'idea' && !isNilOrError(idea)) {
      postTitle = localize(idea.attributes.title_multiloc);
      postUrl = `${location.origin}/${locale}/${postType}s/${idea.attributes.slug}`;
    }

    if (postType === 'initiative' && !isNilOrError(initiative)) {
      postTitle = localize(initiative.attributes.title_multiloc);
      postUrl = `${location.origin}/${locale}/${postType}s/${initiative.attributes.slug}`;
    }

    return { postTitle, postUrl };
  };

  getIdeaMessages = () => {
    const { project, phases } = this.props;
    let emailSharingSubject: ReactIntl.FormattedMessage.MessageDescriptor | null = null;
    let emailSharingBody: ReactIntl.FormattedMessage.MessageDescriptor | null = null;
    let whatsAppMessage: ReactIntl.FormattedMessage.MessageDescriptor | null = null;

    if (!isNilOrError(project)) {
      const inputTerm = getInputTerm(
        project.attributes.process_type,
        project,
        phases
      );

      emailSharingSubject = getInputTermMessage(inputTerm, {
        idea: messages.ideaEmailSharingSubjectText,
        option: messages.optionEmailSharingSubject,
        project: messages.projectEmailSharingSubject,
        question: messages.questionEmailSharingSubject,
        issue: messages.issueEmailSharingSubject,
        contribution: messages.contributionEmailSharingSubject,
      });
      emailSharingBody = getInputTermMessage(inputTerm, {
        idea: messages.ideaEmailSharingBody,
        option: messages.optionEmailSharingBody,
        project: messages.projectEmailSharingBody,
        question: messages.questionEmailSharingModalContentBody,
        issue: messages.issueEmailSharingBody,
        contribution: messages.contributionEmailSharingBody,
      });
      whatsAppMessage = getInputTermMessage(inputTerm, {
        idea: messages.ideaWhatsAppMessage,
        option: messages.optionWhatsAppMessage,
        project: messages.projectWhatsAppMessage,
        question: messages.questionWhatsAppMessage,
        issue: messages.issueWhatsAppMessage,
        contribution: messages.contributionWhatsAppMessage,
      });
    }

    return { emailSharingSubject, emailSharingBody, whatsAppMessage };
  };

  getInitiativeMessages = () => {
    const emailSharingSubject = messages.initiativeEmailSharingSubject;
    const emailSharingBody = messages.initiativeEmailSharingBody;
    const whatsAppMessage = messages.whatsAppMessageProposal;

    return { emailSharingSubject, emailSharingBody, whatsAppMessage };
  };

  getMessages = () => {
    const { postType } = this.props;

    if (postType === 'idea') {
      return this.getIdeaMessages();
    } else {
      return this.getInitiativeMessages();
    }
  };

  render() {
    const { postType, authUser, className, title, subtitle } = this.props;
    const { formatMessage } = this.props.intl;

    const { postTitle, postUrl } = this.getPostValues();
    const {
      emailSharingBody,
      emailSharingSubject,
      whatsAppMessage,
    } = this.getMessages();

    if (
      !isNilOrError(authUser) &&
      postUrl &&
      emailSharingBody &&
      emailSharingSubject &&
      whatsAppMessage
    ) {
      return (
        <Container className={className}>
          <Rocket src={rocket} alt="rocket" />
          <Title className={`e2e-${postType}-social-sharing-modal-title`}>
            {title}
          </Title>
          <Description>{subtitle}</Description>
          <SharingWrapper>
            <SharingButtons
              context={postType}
              isInModal
              url={postUrl}
              twitterMessage={formatMessage(messages.twitterMessage, {
                postTitle,
              })}
              whatsAppMessage={formatMessage(whatsAppMessage, {
                postTitle,
              })}
              emailSubject={formatMessage(emailSharingSubject, { postTitle })}
              emailBody={formatMessage(emailSharingBody, {
                postTitle,
                postUrl,
              })}
              utmParams={{
                source: `share_${postType}`,
                campaign: `${postType}flow`,
                content: authUser.id,
              }}
            />
          </SharingWrapper>
        </Container>
      );
    }

    return (
      <Loading>
        <Spinner />
      </Loading>
    );
  }
}

const SharingModalContentWithHoCs = injectIntl<Props>(
  localize(SharingModalContent)
);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  idea: ({ postId, postType, render }) => (
    <GetIdea ideaId={postId && postType === 'idea' ? postId : null}>
      {render}
    </GetIdea>
  ),
  initiative: ({ postId, postType, render }) => (
    <GetInitiative id={postId && postType === 'initiative' ? postId : null}>
      {render}
    </GetInitiative>
  ),
  project: ({ idea, render }) => (
    <GetProject
      projectId={
        !isNilOrError(idea) ? idea.relationships.project.data.id : null
      }
    >
      {render}
    </GetProject>
  ),
  phases: ({ idea, render }) => (
    <GetPhases
      projectId={
        !isNilOrError(idea) ? idea.relationships.project.data.id : null
      }
    >
      {render}
    </GetPhases>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <SharingModalContentWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
