import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FeatureFlag from 'components/FeatureFlag';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// events
import { commentTranslateButtonClicked } from './events';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// types
import { GetCommentChildProps } from 'resources/GetComment';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { GetAppConfigurationLocalesChildProps } from 'resources/GetAppConfigurationLocales';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TranslateButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
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
  comment: GetCommentChildProps;
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
  className?: string;
}

const CommentTranslateButton = memo<Props>(
  ({ comment, locale, tenantLocales, className }) => {
    const [translateButtonClicked, setTranslateButtonClicked] = useState(false);

    const onTranslate = useCallback(() => {
      if (!isNilOrError(comment)) {
        const {
          clickGoBackToOriginalCommentButton,
          clickTranslateCommentButton,
        } = tracks;
        const eventName = translateButtonClicked
          ? clickGoBackToOriginalCommentButton
          : clickTranslateCommentButton;
        trackEventByName(eventName);
        setTranslateButtonClicked((value) => !value);
        commentTranslateButtonClicked(comment.id);
      }
    }, [comment, translateButtonClicked]);

    if (
      !isNilOrError(comment) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(locale)
    ) {
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const showTranslateButton = !!(
        commentBodyMultiloc &&
        !commentBodyMultiloc[locale] &&
        tenantLocales.length > 1
      );

      if (showTranslateButton) {
        return (
          <FeatureFlag name="machine_translations">
            <Container className={`translate ${className || ''}`}>
              <TranslateButton onClick={onTranslate}>
                {!translateButtonClicked ? (
                  <FormattedMessage {...messages.seeTranslation} />
                ) : (
                  <FormattedMessage {...messages.seeOriginal} />
                )}
              </TranslateButton>
            </Container>
          </FeatureFlag>
        );
      }
    }

    return null;
  }
);

export default CommentTranslateButton;
