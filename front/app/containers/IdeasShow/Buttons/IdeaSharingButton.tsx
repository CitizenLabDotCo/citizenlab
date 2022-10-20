import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'services/participationContexts';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';
import { getInputTermMessage } from 'utils/i18n';

// hooks
import useIdea from 'hooks/useIdea';
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import SharingButtons from 'components/Sharing/SharingButtons';

interface Props {
  className?: string;
  ideaId: string;
  buttonComponent: JSX.Element;
}

const Component = ({
  ideaId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const idea = useIdea({ ideaId });
  const projectId = !isNilOrError(idea)
    ? idea.relationships.project.data.id
    : null;
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const authUser = useAuthUser();
  const localize = useLocalize();

  if (!isNilOrError(idea) && !isNilOrError(project)) {
    const postUrl = `${location.origin}/ideas/${idea.attributes.slug}`;
    const titleMultiloc = idea.attributes.title_multiloc;
    const postTitle = localize(titleMultiloc);
    const inputTerm = getInputTerm(
      project.attributes.process_type,
      project,
      phases
    );

    const utmParams = !isNilOrError(authUser)
      ? {
          source: 'share_idea',
          campaign: 'share_content',
          content: authUser.id,
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

export default injectIntl(Component);
