import React from 'react';
import styled from 'styled-components';
import GoToCommentsButton from '../Buttons/GoToCommentsButton';
import SharingButton from '../Buttons/SharingButton';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

import useIdea from 'hooks/useIdea';
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'hooks/useAuthUser';

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
`;

interface Props {
  ideaId: string;
  border?: string;
}

const Component = ({
  ideaId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const idea = useIdea({ ideaId });
  const authUser = useAuthUser();
  const localize = useLocalize();

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting.enabled;
    const ideaUrl = location.href;
    const titleMultiloc = idea.attributes.title_multiloc;
    const ideaTitle = localize(titleMultiloc);

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
      <>
        {commentingEnabled && <StyledGoToCommentsButton />}
        <SharingButton
          url={ideaUrl}
          twitterMessage={formatMessage(messages.twitterMessage, {
            ideaTitle,
          })}
          emailSubject={formatMessage(messages.emailSharingSubject, {
            ideaTitle,
          })}
          emailBody={formatMessage(messages.emailSharingBody, {
            ideaUrl,
            ideaTitle,
          })}
          utmParams={utmParams}
          buttonCopy={formatMessage(messages.shareIdea)}
        />
      </>
    );
  }

  return null;
};

export default injectIntl(Component);
