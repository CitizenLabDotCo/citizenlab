import React, { PureComponent } from 'react';
import bowser from 'bowser';

// typings
import { IParticipationContextType } from 'typings';

// components
import { Dropdown, Icon } from 'cl2-component-library';
import PBBasket from './PBBasket';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ManageBudgetButton = styled.button`
  height: 100%;
  display: flex;
  color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
  opacity: 0.6;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;

  &:focus,
  &:hover {
    color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
    opacity: 1;
  }
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 18px;
  height: 18px;
  margin-right: 9px;
`;

const DropdownWrapper = styled.div`
  width: 100%;
  flex: 0 0 0px;
  position: relative;
  display: flex;
  justify-content: center;
`;

interface Props {
  participationContextId: string | null;
  participationContextType: IParticipationContextType;
  className?: string;
}

interface State {
  dropdownOpened: boolean;
}

export default class PBNavbarButton extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false,
    };
  }

  toggleDropdown = () => {
    this.setState(({ dropdownOpened }) => ({
      dropdownOpened: !dropdownOpened,
    }));
  };

  render() {
    const {
      participationContextType,
      participationContextId,
      className,
    } = this.props;
    const { dropdownOpened } = this.state;

    return (
      <Container className={className}>
        <ManageBudgetButton
          onClick={this.toggleDropdown}
          aria-expanded={dropdownOpened}
        >
          <StyledIcon name="moneybag" className="moneybag" ariaHidden />
          <FormattedMessage {...messages.manageBudget} />
        </ManageBudgetButton>

        <DropdownWrapper>
          <Dropdown
            top="-5px"
            right={bowser.msie ? '-5px' : 'auto'}
            opened={dropdownOpened}
            onClickOutside={this.toggleDropdown}
            content={
              <PBBasket
                participationContextType={participationContextType}
                participationContextId={participationContextId}
              />
            }
          />
        </DropdownWrapper>
      </Container>
    );
  }
}
