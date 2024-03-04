import React, { useEffect } from 'react';

import {
  Spinner,
  Box,
  Text,
  Title,
  Image,
} from '@citizenlab/cl2-component-library';
import rocket from 'assets/img/rocket.png';
import { MessageDescriptor } from 'react-intl';

import SharingButtons from 'components/Sharing/SharingButtons';
import Centerer from 'components/UI/Centerer';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

import useIdeaById from 'api/ideas/useIdeaById';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import messages from './messages';

// tracking

import tracks from './tracks';

import { getInputTerm } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

interface Props {
  postType: 'idea' | 'initiative';
  postId: string | null;
  className?: string;
  title: string;
  subtitle: string;
}

const SharingModalContent = ({
  postId,
  postType,
  className,
  title,
  subtitle,
}: Props) => {
  const { formatMessage } = useIntl();
  const initiativeId = postType === 'initiative' && postId ? postId : undefined;
  const ideaId = postType === 'idea' && postId ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: phases } = usePhases(idea?.data.relationships.project.data.id);
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
  const localize = useLocalize();

  useEffect(() => {
    trackEventByName(tracks.sharingModalOpened.name, {
      postId,
      postType,
    });
  }, [postId, postType]);

  const getPostValues = () => {
    let postTitle: string | null = null;
    let postUrl: string | null = null;

    if (postType === 'idea' && idea) {
      postTitle = localize(idea.data.attributes.title_multiloc);
      postUrl = `${location.origin}/${locale}/${postType}s/${idea.data.attributes.slug}`;
    }

    if (postType === 'initiative' && initiative) {
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
      const inputTerm = getInputTerm(phases?.data);

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
    authUser &&
    typeof postUrl === 'string' &&
    typeof postTitle === 'string' &&
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
            content: authUser.data.id,
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

export default SharingModalContent;
