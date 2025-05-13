import React, { memo, useState, useCallback, MouseEvent } from 'react';

import {
  LocaleSwitcher,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { truncate } from 'lodash-es';
import { darken } from 'polished';
import styled from 'styled-components';
import { Multiloc, SupportedLocale } from 'typings';

import { FormattedMessage } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';

const Container = styled.div`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Content = styled.div``;

const ContentTitle = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-bottom: 12px;
`;

const ContentBody = styled.div``;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

const ReadMoreButton = styled.button`
  color: ${colors.teal400};
  font-weight: 500;
  margin: 0;
  margin-top: 12px;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.2, colors.teal400)};
  }
`;

interface Props {
  contentTitle: Multiloc | null;
  contentBody: Multiloc;
  className?: string;
}

const ModerationContentCell = memo<Props>(
  ({ contentTitle, contentBody, className }) => {
    const contentBodyLocales = Object.keys(contentBody) as SupportedLocale[];

    const [selectedLocale, setSelectedLocale] = useState(contentBodyLocales[0]);
    const [expanded, setExpanded] = useState(false);

    const handleOnSelectedLocaleChange = useCallback(
      (newSelectedLocale: SupportedLocale) => {
        setSelectedLocale(newSelectedLocale);
      },
      []
    );

    const handleOnReadMore = useCallback(
      (event: MouseEvent) => {
        event.preventDefault();
        setExpanded(!expanded);
      },
      [expanded]
    );

    return (
      <Container className={className}>
        {contentBodyLocales.length > 1 && (
          <StyledLocaleSwitcher
            onSelectedLocaleChange={handleOnSelectedLocaleChange}
            locales={contentBodyLocales}
            selectedLocale={selectedLocale}
          />
        )}
        <Content>
          {contentTitle && contentTitle[selectedLocale] && (
            <ContentTitle>{contentTitle[selectedLocale]}</ContentTitle>
          )}

          <ContentBody
            dangerouslySetInnerHTML={{
              __html: expanded
                ? (contentBody[selectedLocale] as string)
                : truncate(contentBody[selectedLocale], {
                    length: 300,
                    separator: ' ',
                  }),
            }}
          />

          {(contentBody[selectedLocale] as string).length > 300 && (
            <ReadMoreButton
              onMouseDown={removeFocusAfterMouseClick}
              onClick={handleOnReadMore}
            >
              {!expanded ? (
                <>
                  <FormattedMessage {...messages.readMore} />
                  ...
                </>
              ) : (
                <FormattedMessage {...messages.collapse} />
              )}
            </ReadMoreButton>
          )}
        </Content>
      </Container>
    );
  }
);

export default ModerationContentCell;
