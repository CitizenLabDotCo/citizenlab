import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'services/participationContexts';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';
import { getInputTermMessage } from 'utils/i18n';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import SharingButtons from 'components/Sharing/SharingButtons';

interface Props {
  className?: string;
  ideaId: string;
  buttonComponent: JSX.Element;
}

const Component = ({ ideaId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idea } = useIdeaById(ideaId);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : undefined;
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: authUser } = useAuthUser();
  const localize = useLocalize();

  if (!isNilOrError(idea) && !isNilOrError(project)) {
    const postUrl = `${location.origin}/ideas/${idea.data.attributes.slug}`;
    const titleMultiloc = idea.data.attributes.title_multiloc;
    const postTitle = localize(titleMultiloc);
    const inputTerm = getInputTerm(
      project.data.attributes.process_type,
      project.data,
      phases?.data
    );

    const utmParams = !isNilOrError(authUser)
      ? {
          source: 'share_idea',
          campaign: 'share_content',
          content: authUser.data.id,
        }
      : {
          source: 'share_idea',
          campaign: 'share_content',
        };

    return (
      <SharingButtons
        url={postUrl}
        facebookMessage={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaFacebookMessage,
            option: messages.optionFacebookMessage,
            project: messages.projectFacebookMessage,
            question: messages.questionFacebookMessage,
            issue: messages.issueFacebookMessage,
            contribution: messages.contributionFacebookMessage,
          }),
          {
            postTitle,
          }
        )}
        whatsAppMessage={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaWhatsAppMessage,
            option: messages.optionWhatsAppMessage,
            project: messages.projectWhatsAppMessage,
            question: messages.questionWhatsAppMessage,
            issue: messages.issueWhatsAppMessage,
            contribution: messages.contributionWhatsAppMessage,
          }),
          {
            postTitle,
          }
        )}
        twitterMessage={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaTwitterMessage,
            option: messages.optionTwitterMessage,
            project: messages.projectTwitterMessage,
            question: messages.questionTwitterMessage,
            issue: messages.issueTwitterMessage,
            contribution: messages.contributionTwitterMessage,
          }),
          {
            postTitle,
          }
        )}
        emailSubject={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaEmailSharingSubject,
            option: messages.optionEmailSharingSubject,
            project: messages.projectEmailSharingSubject,
            question: messages.questionEmailSharingSubject,
            issue: messages.issueEmailSharingSubject,
            contribution: messages.contributionEmailSharingSubject,
          }),
          {
            ideaTitle: postTitle,
          }
        )}
        emailBody={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaEmailSharingBody,
            option: messages.optionEmailSharingBody,
            project: messages.projectEmailSharingBody,
            question: messages.questionEmailSharingBody,
            issue: messages.issueEmailSharingBody,
            contribution: messages.contributionEmailSharingBody,
          }),
          {
            ideaUrl: postUrl,
            ideaTitle: postTitle,
          }
        )}
        utmParams={utmParams}
        context={'idea'}
      />
    );
  }

  return null;
};

export default Component;
