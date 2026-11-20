import React, { memo, useCallback, useState } from 'react';

import styled from 'styled-components';

import useComment from 'api/comments/useComment';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { commentTranslateButtonClicked } from 'components/PostShowComponents/Comments/events';
import tracks from 'components/PostShowComponents/Comments/tracks';

import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';

import TranslationNotice from './TranslationNotice';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
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

  // The translation is shown by default. Keep in sync with CommentBody.
  const [translateButtonClicked, setTranslateButtonClicked] = useState(true);

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
        <TranslationNotice
          multiloc={commentBodyMultiloc}
          showTranslation={translateButtonClicked}
          onToggle={onTranslate}
        />
      </Container>
    );
  }

  return null;
});

export default styled(CommentTranslateButton)`
  height: 30px;
  margin-top: 6px;
`;
