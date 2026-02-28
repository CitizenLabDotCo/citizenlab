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

import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import SharingButtons from 'components/Sharing/SharingButtons';
import Centerer from 'components/UI/Centerer';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';
import tracks from './tracks';

interface Props {
  postId: string | null;
  className?: string;
  title: string;
  subtitle: string;
}

const SharingModalContent = ({ postId, className, title, subtitle }: Props) => {
  const { formatMessage } = useIntl();
  const ideaId = postId;
  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: phases } = usePhases(idea?.data.relationships.project.data.id);
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
  const localize = useLocalize();

  useEffect(() => {
    trackEventByName(tracks.sharingModalOpened, {
      postId,
      postType: 'idea',
    });
  }, [postId]);

  const getPostValues = () => {
    let postTitle: string | null = null;
    let postUrl: string | null = null;

    if (idea) {
      postTitle = localize(idea.data.attributes.title_multiloc);
      postUrl = `${location.origin}/${locale}/ideas/${idea.data.attributes.slug}`;
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
        initiative: messages.initiativeEmailSharingSubject,
        proposal: messages.proposalEmailSharingSubject,
        petition: messages.petitionEmailSharingSubject,
        comment: messages.commentEmailSharingSubject,
        response: messages.responseEmailSharingSubject,
        suggestion: messages.suggestionEmailSharingSubject,
        topic: messages.topicEmailSharingSubject,
        post: messages.postEmailSharingSubject,
        story: messages.storyEmailSharingSubject,
      });
      emailSharingBody = getInputTermMessage(inputTerm, {
        idea: messages.ideaEmailSharingBody,
        option: messages.optionEmailSharingBody,
        project: messages.projectEmailSharingBody,
        question: messages.questionEmailSharingModalContentBody,
        issue: messages.issueEmailSharingBody,
        contribution: messages.contributionEmailSharingBody,
        initiative: messages.initiativeEmailSharingBody,
        proposal: messages.proposalEmailSharingBody,
        petition: messages.petitionEmailSharingBody,
        comment: messages.commentEmailSharingBody,
        response: messages.responseEmailSharingBody,
        suggestion: messages.suggestionEmailSharingBody,
        topic: messages.topicEmailSharingBody,
        post: messages.postEmailSharingBody,
        story: messages.storyEmailSharingBody,
      });
      whatsAppMessage = getInputTermMessage(inputTerm, {
        idea: messages.ideaWhatsAppMessage,
        option: messages.optionWhatsAppMessage,
        project: messages.projectWhatsAppMessage,
        question: messages.questionWhatsAppMessage,
        issue: messages.issueWhatsAppMessage,
        contribution: messages.contributionWhatsAppMessage,
        initiative: messages.initiativeWhatsAppMessage,
        proposal: messages.proposalWhatsAppMessage,
        petition: messages.petitionWhatsAppMessage,
        comment: messages.commentWhatsAppMessage,
        response: messages.responseWhatsAppMessage,
        suggestion: messages.suggestionWhatsAppMessage,
        topic: messages.topicWhatsAppMessage,
        post: messages.postWhatsAppMessage,
        story: messages.storyWhatsAppMessage,
      });
    }

    return { emailSharingSubject, emailSharingBody, whatsAppMessage };
  };

  const getMessages = () => {
    return getIdeaMessages();
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
          className={`e2e-idea-social-sharing-modal-title`}
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
          context={'idea'}
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
            source: `share_idea`,
            campaign: `ideaflow`,
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
