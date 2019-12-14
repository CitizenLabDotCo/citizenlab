import React, { memo, useState, useCallback } from 'react';

// components
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

// styling
import styled from 'styled-components';

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

interface Props {
  content: Multiloc;
  className?: string;
}

const ModerationContentCell = memo<Props>(({ content, className }) => {
  const contentLocales = Object.keys(content) as Locale[];

  const [selectedLocale, setSelectedLocale] = useState(contentLocales[0]);

  const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
    setSelectedLocale(newSelectedLocale);
  }, []);

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
        <ContentBody dangerouslySetInnerHTML={{ __html: content[selectedLocale] }} />
      </Content>
    </Container>
  );
});

export default ModerationContentCell;
