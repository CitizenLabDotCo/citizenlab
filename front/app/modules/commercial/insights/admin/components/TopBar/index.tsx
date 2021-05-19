import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import { withRouter, WithRouterProps } from 'react-router';
import { injectIntl } from 'utils/cl-intl';

import useInsightsView from '../../../hooks/useInsightsView';
import useLocale from 'hooks/useLocale';
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { lighten } from 'polished';

import { Dropdown, DropdownListItem, Button } from 'cl2-component-library';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: ${lighten('0.2', colors.adminBackground)};
  h1 {
    margin: 0;
    fontsize: ${fontSizes.xl};
  }
`;

const DropdownWrapper = styled.div`
  display: flex;
  color: ${colors.label};
  align-items: center;
  position: relative;
  .dropdown {
    right: 10px;
    top: 40px;
  }
`;

const TopBar = ({
  params,
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const locale = useLocale();
  const viewId = params.viewId;
  const view = useInsightsView(viewId);

  if (isNilOrError(view)) {
    return null;
  }

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  return (
    <Container>
      <h1>{view.attributes.name}</h1>
      <DropdownWrapper>
        {formatMessage(messages.options)}
        {!isNilOrError(locale) && (
          <Button
            icon="more-options"
            locale={locale}
            iconColor={colors.label}
            iconHoverColor={colors.label}
            boxShadow="none"
            boxShadowHover="none"
            bgColor="transparent"
            bgHoverColor="transparent"
            onClick={toggleDropdown}
          />
        )}
        <Dropdown
          opened={isDropdownOpened}
          onClickOutside={closeDropdown}
          className="dropdown"
          content={
            <>
              <DropdownListItem key={1}>
                {formatMessage(messages.editName)}
              </DropdownListItem>
              <DropdownListItem key={2}>
                {formatMessage(messages.delete)}
              </DropdownListItem>
              <DropdownListItem key={3}>
                {formatMessage(messages.duplicate)}
              </DropdownListItem>
            </>
          }
        />
      </DropdownWrapper>
    </Container>
  );
};

export default injectIntl(withRouter(TopBar));
