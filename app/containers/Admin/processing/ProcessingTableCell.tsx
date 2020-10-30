import React, { memo, useState, useCallback } from 'react';

// components
import { LocaleSwitcher } from 'cl2-component-library';

// i18n

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc, Locale } from 'typings';

const Container = styled.div`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Content = styled.div``;

const ContentTitle = styled.div`
  display: inline-block;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

interface Props {
  contentTitle: Multiloc;
  className?: string;
  handleClick: () => void;
}

const ProcessingTableCell = memo<Props>(
  ({ contentTitle, className, handleClick }) => {
    const contentTitleLocales = Object.keys(contentTitle) as Locale[];

    const [selectedLocale, setSelectedLocale] = useState(
      contentTitleLocales[0]
    );

    const handleOnSelectedLocaleChange = useCallback(
      (newSelectedLocale: Locale) => {
        setSelectedLocale(newSelectedLocale);
      },
      []
    );
    return (
      <Container className={className}>
        {contentTitleLocales.length > 1 && (
          <StyledLocaleSwitcher
            onSelectedLocaleChange={handleOnSelectedLocaleChange}
            locales={contentTitleLocales}
            selectedLocale={selectedLocale}
          />
        )}
        <Content>
          {contentTitle && contentTitle[selectedLocale] && (
            <ContentTitle onClick={handleClick}>
              {contentTitle[selectedLocale]}
            </ContentTitle>
          )}
        </Content>
      </Container>
    );
  }
);

export default ProcessingTableCell;
