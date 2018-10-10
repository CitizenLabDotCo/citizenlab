import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { omit } from 'lodash-es';
import Popover, { Props as PopoverProps } from 'components/UI/Popover';
import { Omit } from 'typings';

const ContentWrapper = styled.div`
  padding: 15px;
`;
interface Props extends Omit<PopoverProps, 'onClickOutside'|'dropdownOpened'> {
  /** whether the tooltip should work at all */
  enabled: boolean;
}

interface State {
  opened: boolean;
}

export default class Tooltip extends PureComponent<Props, State> {

    public static defaultProps = {
      top: '0px',
      backgroundColor: 'white',
      enabled: true,
    };

    constructor(props) {
      super(props);
      this.state = {
        opened: false,
      };
    }

    handleOnMouseEnter = () => {
      this.setState({ opened: true });
    }

    handleOnMouseLeave = () => {
      this.setState({ opened: false });
    }

    render() {
      const { opened } = this.state;
      const { content, enabled } = this.props;
      const passthroughProps = omit(this.props, ['dropdownOpened', 'onClickOutside', 'content']);
      return (
        <div
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
        >
          <Popover
            {...passthroughProps}
            content={
              <ContentWrapper>
                {content}
              </ContentWrapper>
            }
            dropdownOpened={enabled && opened}
            onClickOutside={this.handleOnMouseLeave}
          />
        </div>
      );
    }
}
