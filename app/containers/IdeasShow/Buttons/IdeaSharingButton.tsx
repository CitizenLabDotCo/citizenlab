import React from 'react';
import SharingDropdownButton from 'components/Sharing/SharingDropdownButton';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'services/participationContexts';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { getInputTermMessage } from 'utils/i18n';

// hooks
import useIdea from 'hooks/useIdea';
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

interface Props {
  className?: string;
  ideaId: string;
  buttonComponent: JSX.Element;
}

const Component = ({
  className,
  ideaId,
  buttonComponent,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const idea = useIdea({ ideaId });
  const projectId = !isNilOrError(idea)
    ? idea.relationships.project.data.id
    : null;
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const authUser = useAuthUser();
  const localize = useLocalize();

  if (!isNilOrError(idea) && !isNilOrError(project)) {
    const ideaUrl = location.href;
    const titleMultiloc = idea.attributes.title_multiloc;
    const ideaTitle = localize(titleMultiloc);
    const inputTerm = getInputTerm(
      project.attributes.process_type === 'continuous' ? 'project' : 'phase',
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
      <SharingDropdownButton
        className={className}
        url={ideaUrl}
        whatsAppMessage={formatMessage(messages.whatsAppMessage, {
          ideaTitle,
        })}
        twitterMessage={formatMessage(messages.twitterMessage, {
          ideaTitle,
        })}
        emailSubject={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaEmailSharingSubject,
          }),
          {
            ideaTitle,
          }
        )}
        emailBody={formatMessage(
          getInputTermMessage(inputTerm, {
            idea: messages.ideaEmailSharingBody,
          }),
          {
            ideaUrl,
            ideaTitle,
          }
        )}
        utmParams={utmParams}
        buttonComponent={buttonComponent}
      />
    );
  }

  return null;
};

export default injectIntl(Component);
