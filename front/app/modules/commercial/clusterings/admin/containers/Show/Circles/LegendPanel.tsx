import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import clickOutside from 'utils/containers/clickOutside';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

const Container = styled(clickOutside)`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TabbedNav = styled.nav`
  flex: 0 0 55px;
  background: #fcfcfc;
  border-radius: ${(props: any) => props.theme.borderRadius}
    ${(props: any) => props.theme.borderRadius} 0 0;
  padding-left: 30px;
  display: flex;
  align-items: stretch;
  border: solid 1px ${colors.separation};
  border-bottom: none;
`;

const Tab = styled.li`
  color: ${colors.label};
  font-size: ${fontSizes.base};
  font-weight: 400;
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: solid 3px transparent;
  margin-right: 40px;

  &:first-letter {
    text-transform: uppercase;
  }

  &.active {
    color: ${colors.adminTextColor};
    border-color: ${colors.clBlueDark};
  }

  &:not(.active):hover {
    border-color: transparent;
  }
`;

const Content: any = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: solid 1px ${colors.adminBorder};
  border-radius: 0 0 ${(props: any) => props.theme.borderRadius}
    ${(props: any) => props.theme.borderRadius};
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 20px;
  overflow: hidden;
  display: ${(props) => ((props as any).showContent ? 'block' : 'none')};
`;

const ListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  svg {
    margin-right: 15px;
  }
  .key {
    margin-right: 15px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    padding: 2px 5px;
    border: 1px solid;
    font-weight: 600;
  }
`;

const StyledCircle: any = styled.circle`
  position: relative;
  fill: ${(props) => props.color};
`;
const StyledEmptyCircle: any = styled.circle`
  position: relative;
  fill: transparent;
  stroke: ${colors.adminTextColor};
  stroke-width: 2;
`;
const StyledLine: any = styled.line`
  position: relative;
  fill: transparent;
  stroke: ${colors.adminTextColor};
  stroke-width: 2;
`;

interface Props {
  onClickOutside: () => void;
}

interface State {
  selectedTab: 'legend' | 'controls';
}

export default class LegendPanel extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'legend',
    };
  }

  handleTabOnClick = (tabName: 'legend' | 'controls') => (event: any) => {
    event.preventDefault();
    this.setState({ selectedTab: tabName });
  };

  render() {
    const { selectedTab } = this.state;
    const { onClickOutside } = this.props;
    return (
      <Container
        className={this.props['className']}
        onClickOutside={onClickOutside}
      >
        <TabbedNav>
          <Tab
            onClick={this.handleTabOnClick('legend')}
            data-tab="legend"
            className={`${selectedTab === 'legend' && 'active'}`}
          >
            <FormattedMessage {...messages.legend} />
          </Tab>
          <Tab
            onClick={this.handleTabOnClick('controls')}
            data-tab="controls"
            className={`${selectedTab === 'controls' && 'active'}`}
          >
            <FormattedMessage {...messages.controls} />
          </Tab>
        </TabbedNav>
        <Content showContent={selectedTab === 'legend'}>
          <ListItem>
            <svg height={20} width={20}>
              <StyledCircle r={10} transform="translate(10,10)" color="green" />
            </svg>
            <FormattedMessage {...messages.upvotes} />
          </ListItem>
          <ListItem>
            <svg height={20} width={20}>
              <StyledCircle r={10} transform="translate(10,10)" color="red" />
            </svg>
            <FormattedMessage {...messages.downvotes} />
          </ListItem>
          <ListItem>
            <svg height={20} width={20}>
              <StyledCircle r={10} transform="translate(10,10)" color="blue" />
            </svg>
            <FormattedMessage {...messages.noVotes} />
          </ListItem>
          <ListItem>
            <svg height={20} width={20}>
              <StyledLine x1="0" y1="20" x2="20" y2="0" />
              <StyledEmptyCircle r={9} transform="translate(10,10)" />
            </svg>
            <FormattedMessage {...messages.numVotes} />
          </ListItem>
        </Content>
        <Content showContent={selectedTab === 'controls'}>
          <ListItem>
            <span className="key">Click</span>
            <FormattedMessage {...messages.clickLegend} />
          </ListItem>
          <ListItem>
            <span className="key">Shift</span>
            <FormattedMessage {...messages.shiftLegend} />
          </ListItem>
          <ListItem>
            <span className="key">Ctrl</span>
            <FormattedMessage {...messages.ctrlLegend} />
          </ListItem>
        </Content>
      </Container>
    );
  }
}
