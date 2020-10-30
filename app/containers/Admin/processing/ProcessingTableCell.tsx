import React, { memo, useState, useCallback, MouseEvent } from 'react';
import { truncate } from 'lodash-es';

// components
import { LocaleSwitcher } from 'cl2-component-library';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import T from 'components/T';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { Multiloc, Locale } from 'typings';
import Tippy from '@tippyjs/react';

const Container = styled.div`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Content = styled.div``;

const ContentTitle = styled.div`
  display: inline-block;
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-bottom: 12px;
  text-decoration: underline;
  cursor: pointer;
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
            <Tippy
              placement="bottom-start"
              content={<FormattedMessage {...messages.helpTooltipText} />}
            >
              <ContentTitle onClick={handleClick}>
                {contentTitle[selectedLocale]}
              </ContentTitle>
            </Tippy>
          )}
        </Content>
      </Container>
    );
  }
);

export default ProcessingTableCell;
