import React, { useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { getInputTerm } from 'utils/participationContexts';

// components
import SharingButtons from 'components/Sharing/SharingButtons';
import {
  Spinner,
  Box,
  Text,
  Title,
  Image,
} from '@citizenlab/cl2-component-library';
import Centerer from 'components/UI/Centerer';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import rocket from 'assets/img/rocket.png';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

interface InputProps {
  postType: 'idea' | 'initiative';
  postId: string | null;
  className?: string;
  title: string;
  subtitle: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

const SharingModalContent = ({
  postId,
  postType,
  localize,
  locale,
  intl: { formatMessage },
  className,
  authUser,
  title,
  subtitle,
}: Props & WrappedComponentProps & InjectedLocalized) => {
  const initiativeId = postType === 'initiative' && postId ? postId : undefined;
  const ideaId = postType === 'idea' && postId ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: phases } = usePhases(idea?.data.relationships.project.data.id);

  useEffect(() => {
    trackEventByName(tracks.sharingModalOpened.name, {
      postId,
      postType,
    });
  }, [postId, postType]);

  const getPostValues = () => {
    let postTitle: string | null = null;
    let postUrl: string | null = null;

    if (postType === 'idea' && !isNilOrError(idea)) {
      postTitle = localize(idea.data.attributes.title_multiloc);
      postUrl = `${location.origin}/${locale}/${postType}s/${idea.data.attributes.slug}`;
    }

    if (postType === 'initiative' && !isNilOrError(initiative)) {
      postTitle = localize(initiative.data.attributes.title_multiloc);
      postUrl = `${location.origin}/${locale}/${postType}s/${initiative.data.attributes.slug}`;
    }

    return { postTitle, postUrl };
  };

  const getIdeaMessages = () => {
    let emailSharingSubject: MessageDescriptor | null = null;
    let emailSharingBody: MessageDescriptor | null = null;
    let whatsAppMessage: MessageDescriptor | null = null;

    if (project) {
      const inputTerm = getInputTerm(
        project.data.attributes.process_type,
        project.data,
        phases?.data
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

  const getInitiativeMessages = () => {
    const emailSharingSubject = messages.initiativeEmailSharingSubject;
    const emailSharingBody = messages.initiativeEmailSharingBody;
    const whatsAppMessage = messages.whatsAppMessageProposal;

    return { emailSharingSubject, emailSharingBody, whatsAppMessage };
  };

  const getMessages = () => {
    if (postType === 'idea') {
      return getIdeaMessages();
    } else {
      return getInitiativeMessages();
    }
  };

  const { postTitle, postUrl } = getPostValues();
  const { emailSharingBody, emailSharingSubject, whatsAppMessage } =
    getMessages();

  if (
    !isNilOrError(authUser) &&
    postUrl &&
    emailSharingBody &&
    emailSharingSubject &&
    whatsAppMessage
  ) {
    return (
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        className={className}
      >
        <Image width="80px" height="80px" src={rocket} alt="" />
        <Title
          variant="h2"
          textAlign="center"
          className={`e2e-${postType}-social-sharing-modal-title`}
        >
          {title}
        </Title>
        <Text
          color="textPrimary"
          mt="12px"
          mb="36px"
          fontSize={'m'}
          textAlign="center"
        >
          {subtitle}
        </Text>
        <SharingButtons
          context={postType}
          url={postUrl}
          facebookMessage={formatMessage(messages.twitterMessage, {
            postTitle,
          })}
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
      </Box>
    );
  }

  return (
    <Centerer height="460px">
      <Spinner />
    </Centerer>
  );
};

const SharingModalContentWithHoCs = injectIntl(localize(SharingModalContent));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <SharingModalContentWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
