import React, { memo, useState, useCallback, MouseEvent } from 'react';
import { truncate } from 'lodash-es';

// components
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { Multiloc, Locale } from 'typings';

const Container = styled.div``;

const Content = styled.div``;

const ContentBody = styled.div``;

const StyledLocaleSwitcher = styled(FormLocaleSwitcher)`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

const ReadMoreButton = styled.button`
  color: ${colors.clIconAccent};
  font-weight: 500;
  margin: 0;
  margin-top: 12px;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.2, colors.clIconAccent)};
  }
`;

interface Props {
  content: Multiloc;
  className?: string;
}

const ModerationContentCell = memo<Props>(({ content, className }) => {
  const contentLocales = Object.keys(content) as Locale[];

  const [selectedLocale, setSelectedLocale] = useState(contentLocales[0]);
  const [expanded, setExpanded] = useState(false);

  const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
    setSelectedLocale(newSelectedLocale);
  }, []);

  const removeFocus = useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleOnReadMore = useCallback((event: MouseEvent) => {
    event.preventDefault();
    setExpanded(!expanded);
  }, [expanded]);

  return (
    <Container className={className}>
      {contentLocales.length > 1 &&
        <StyledLocaleSwitcher
          onLocaleChange={handleOnSelectedLocaleChange}
          locales={contentLocales}
          selectedLocale={selectedLocale}
        />
      }
      <Content>
        <ContentBody dangerouslySetInnerHTML={{ __html: expanded ? content[selectedLocale] as string : truncate(content[selectedLocale], { length: 300, separator: ' ' }) }} />

        {(content[selectedLocale] as string).length > 300 &&
          <ReadMoreButton
            onMouseDown={removeFocus}
            onClick={handleOnReadMore}
          >
            {!expanded ? <><FormattedMessage {...messages.readMore} />...</> : <FormattedMessage {...messages.collapse} />}
          </ReadMoreButton>
        }
      </Content>
    </Container>
  );
});

export default ModerationContentCell;
