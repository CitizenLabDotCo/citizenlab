import React from 'react';

import { InputTerm, ParticipationMethod } from 'api/phases/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

import getNewInputMessage from './getNewInputMessage';
import messages from './messages';
import tracks from './tracks';

interface Props extends TypedLinkProps {
  linkTo?: string;
  inputTerm: InputTerm;
  participationMethod: ParticipationMethod;
}

const NewIdeaButton = ({
  to,
  params,
  search,
  linkTo,
  inputTerm,
  participationMethod,
}: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const buttonText =
    participationMethod === 'common_ground'
      ? formatMessage(messages.createInput)
      : formatMessage(getNewInputMessage(inputTerm));

  return (
    <ButtonWithLink
      id="e2e-new-idea"
      buttonStyle="admin-dark"
      icon="plus"
      to={to}
      params={params}
      search={search}
      linkTo={linkTo}
      onClick={() => {
        trackEventByName(tracks.clickNewIdea.name, {
          pathnameFrom: pathname,
        });
      }}
      text={buttonText}
    />
  );
};

export default NewIdeaButton;
