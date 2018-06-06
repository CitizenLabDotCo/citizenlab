import React from 'react';

// components
import Popover from 'components/Popover';
import Button from 'components/UI/Button';

// style
import styled from 'styled-components';
import { colors, fontSize } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

const StyledPopover = styled(Popover)`
  display: flex;
  flex-direction: column;
  z-index: 5;
`;

const PopoverItem = styled(Button)`
  color: ${colors.label};
  fill: ${colors.label};
  font-size: ${fontSize('large')};
  font-weight: 400;
  transition: all 80ms ease-out;

  .buttonText {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  a.Button,
  button.Button {
    background: #fff;
    border-radius: 5px;

    &:hover,
    &:focus {
      color: #000;
      background: #f6f6f6;
      fill: #000;
    }
  }
`;

type Props = {
  locales: Locale[];
};

type State = {
  PopoverOpened: boolean;
};

export default class LanguageSelector extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      PopoverOpened: false
    };
  }

  render() {
    const { locales } = this.props;
    return (
      <StyledPopover>
      {
        locales.map(locale => (
          <PopoverItem>
            {}
          </PopoverItem>
        ))
      }
      </StyledPopover>
    );
  }
}
