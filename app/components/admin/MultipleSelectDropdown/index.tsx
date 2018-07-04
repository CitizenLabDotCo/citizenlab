// libraries
import React, { PureComponent, FormEvent } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// Components
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';
import Popover from 'components/UI/Popover';
import Spinner from 'components/UI/Spinner';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { lighten, ellipsis } from 'polished';

// typing
import { Message, Multiloc } from 'typings';

const DropdownMenuInner = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DropdownList = styled.div`
  max-height: 210px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin: 10px;
  margin-right: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const DropdownListItem = styled.button`
  align-items: center;
  color: #044D6C;
  font-size: 16px;
  font-weight: 400;
  padding: 10px;
  padding-left: 15px;
  margin-right: 5px;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  flex: 1 0;
  justify-content: space-between !important;

  & > span {
    white-space: nowrap;
    margin-right: 10px;
    ${ellipsis('250px') as any}
  }

  &:hover, &:focus {
    outline: none;
    color: #000;
    background: #f6f6f6;
  }

`;

const DropdownFooter = styled.div`
  width: 100%;
`;

const DropdownFooterButton = styled.button`
  width: 100%;
  height: 50px;
  color: #fff;
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.adminMenuBackground};
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 100ms ease-out;

  &:not(.processing) {
    cursor: pointer;

    &:hover,
    &:focus {
      background: ${lighten(0.1, colors.adminMenuBackground)};
      text-decoration: none;
      outline: none;
    }
  }
`;

type choiceItem = {
  text: Multiloc;
  id: string;
};

interface Props {
  choices: choiceItem[];
  dropdownFooterMessage: Message;
  onSubmit: (ids: string[]) => Promise<any>;
  children: JSX.Element;
  emitSuccess: (ids: string) => void;
  emitError: () => void;
  processing?: boolean;
}

interface State {
  chosen: string[];
  dropdownOpened: boolean;
}

export default class MultipleSelectDropdown extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      chosen: [],
      dropdownOpened: false,
    };
  }

  handleDropdownOnClickOutside = (event: FormEvent<MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropdownOpened: false });
  }

  handleDropdownToggle = () => {
    this.setState(state => ({ dropdownOpened: !state.dropdownOpened }));
  }

  onClickRow = (id) => () => {
    const index = this.state.chosen.indexOf(id);
    if (index < 0) {
      this.setState({ chosen: [...this.state.chosen, id] });
    } else {
      this.setState({
        chosen: this.state.chosen.filter((chosenId) => {
          return id !== chosenId;
        })
      });
    }
  }

  submit = (chosen) => () => {
    if (chosen.length > 0) {
      this.props.onSubmit(chosen).then(() => {
        this.props.emitSuccess(chosen);
        this.setState({ chosen: [], dropdownOpened: false });
      }).catch(() => {
        this.props.emitError();
        this.setState({ dropdownOpened: false });
      });
    }
  }

  render() {
    const { processing, dropdownFooterMessage } = this.props;

    return (
      <Popover
        className={this.props['className']}
        content={
          <>
            <DropdownMenuInner>
              <DropdownList>
                {this.props.choices.length > 0 && this.props.choices.map((choice) => {
                  const id = choice.id;
                  return (
                    <DropdownListItem key={id} onClick={this.onClickRow(id)} className="e2e-dropdown-item">
                      <T value={choice.text} />
                      <Checkbox
                        onChange={this.onClickRow(id)}
                        value={this.state.chosen.includes(id)}
                        size="26px"
                      />
                    </DropdownListItem>
                  );
                })}
              </DropdownList>
              <DropdownFooter>
                <DropdownFooterButton
                  className={`e2e-dropdown-submit ${processing === true && 'processing'}`}
                  onClick={this.submit(this.state.chosen)}
                >
                  {processing !== true ? (
                    <FormattedMessage {...dropdownFooterMessage} />
                  ) : (
                    <Spinner size="28px" color="#fff" />
                  )}
                </DropdownFooterButton>
              </DropdownFooter>
            </DropdownMenuInner>
          </>
        }
        top="40px"
        backgroundColor="#fff"
        handleDropdownOnClickOutside={this.handleDropdownOnClickOutside}
        dropdownOpened={this.state.dropdownOpened}
      >
        <div role="button" onClick={this.handleDropdownToggle}>
          {this.props.children}
        </div>
      </Popover>
    );
  }
}
