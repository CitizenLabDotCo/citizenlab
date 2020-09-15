import React from 'react';
import styled from 'styled-components';
import GoToCommentsButton from './GoToCommentsButton';
import IdeaSharingButton from '../../Buttons/IdeaSharingButton';
import IdeaCTAButton from './IdeaCTAButton';
import { isNilOrError } from 'utils/helperUtils';
import useIdea from 'hooks/useIdea';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
`;

interface Props {
  ideaId: string;
  border?: string;
}

const IdeaCTAButtons = ({
  ideaId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting.enabled;

    return (
      <>
        {commentingEnabled && <StyledGoToCommentsButton />}
        <IdeaSharingButton
          ideaId={ideaId}
          buttonComponent={
            <IdeaCTAButton
              iconName="share-arrow"
              buttonText={formatMessage(messages.shareIdea)}
            />
          }
        />
      </>
    );
  }

  return null;
};

export default injectIntl(IdeaCTAButtons);
