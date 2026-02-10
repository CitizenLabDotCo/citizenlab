import React from 'react';

import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import SharingButtons from 'components/Sharing/SharingButtons';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';

import messages from '../../messages';

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
    const inputTerm = getInputTerm(phases?.data);

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
        whatsAppMessage={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaWhatsAppMessage,
            option: messages.optionWhatsAppMessage,
            project: messages.projectWhatsAppMessage,
            question: messages.questionWhatsAppMessage,
            issue: messages.issueWhatsAppMessage,
            contribution: messages.contributionWhatsAppMessage,
            proposal: messages.proposalWhatsAppMessage,
            initiative: messages.initiativeWhatsAppMessage,
            petition: messages.petitionWhatsAppMessage,
            comment: messages.commentWhatsAppMessage,
            statement: messages.statementWhatsAppMessage,
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
            proposal: messages.proposalTwitterMessage,
            initiative: messages.initiativeTwitterMessage,
            petition: messages.petitionTwitterMessage,
            comment: messages.commentTwitterMessage,
            statement: messages.statementTwitterMessage,
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
            proposal: messages.proposalEmailSharingSubject,
            initiative: messages.initiativeEmailSharingSubject,
            petition: messages.petitionEmailSharingSubject,
            comment: messages.commentEmailSharingSubject,
            statement: messages.statementEmailSharingSubject,
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
            proposal: messages.proposalEmailSharingBody,
            initiative: messages.initiativeEmailSharingBody,
            petition: messages.petitionEmailSharingBody,
            comment: messages.commentEmailSharingBody,
            statement: messages.statementEmailSharingBody,
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
