import React, { memo, useCallback, useState } from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useComment from 'api/comments/useComment';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { commentTranslateButtonClicked } from 'components/PostShowComponents/Comments/events';
import messages from 'components/PostShowComponents/Comments/messages';
import tracks from 'components/PostShowComponents/Comments/tracks';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TranslateButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

interface Props {
  commentId: string;
  className?: string;
}

const CommentTranslateButton = memo<Props>(({ commentId, className }) => {
  const { data: comment } = useComment(commentId);
  const locales = useAppConfigurationLocales();
  const locale = useLocale();
  const machineTranslationsEnabled = useFeatureFlag({
    name: 'machine_translations',
  });

  const [translateButtonClicked, setTranslateButtonClicked] = useState(false);

  const onTranslate = useCallback(() => {
    const { clickGoBackToOriginalCommentButton, clickTranslateCommentButton } =
      tracks;
    const eventName = translateButtonClicked
      ? clickGoBackToOriginalCommentButton
      : clickTranslateCommentButton;
    trackEventByName(eventName);
    setTranslateButtonClicked((value) => !value);
    commentTranslateButtonClicked(commentId);
  }, [translateButtonClicked, commentId]);

  if (isNilOrError(comment) || isNilOrError(locales) || isNilOrError(locale)) {
    return null;
  }

  const commentBodyMultiloc = comment.data.attributes.body_multiloc;
  const showTranslateButton = !!(
    commentBodyMultiloc &&
    !commentBodyMultiloc[locale] &&
    locales.length > 1
  );

  if (machineTranslationsEnabled && showTranslateButton) {
    return (
      <Container className={`translate ${className || ''}`}>
        <TranslateButton onClick={onTranslate}>
          {!translateButtonClicked ? (
            <FormattedMessage {...messages.seeTranslation} />
          ) : (
            <FormattedMessage {...messages.seeOriginal} />
          )}
        </TranslateButton>
      </Container>
    );
  }

  return null;
});

export default styled(CommentTranslateButton)`
  height: 30px;
  margin-top: 6px;
`;
