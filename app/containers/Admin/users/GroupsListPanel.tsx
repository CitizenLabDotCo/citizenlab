// Libraries
import React from 'react';
import { Link } from 'react-router';

// Typings
export interface Props {
  className?: string;
}
export interface State {}

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { rgba } from 'polished';

const Panel = styled.div`
  align-items: stretch;
  background: ${colors.background};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 70px 20px;
`;

const Separator = styled.hr`
  background: ${colors.separation};
  border: none;
  height: 1px;
  margin: 1rem 0 3rem 0;
`;

const PanelEntry = `
  align-items: center;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding: 1rem 1.5rem;
`;

const MenuTitle = styled.div`
  ${PanelEntry}
`;

const MenuLink = styled(Link)`
  ${PanelEntry}

  &.active {
    background: ${rgba(colors.adminTextColor, .1)};
  }
`;

export class GroupsListPanel extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Panel className={this.props.className}>
        <MenuLink to="/admin/users" activeClassName="active" onlyActiveOnIndex>All Users</MenuLink>
        <Separator />
        <MenuTitle>
          <h2>
            Groups
          </h2>
        </MenuTitle>
      </Panel>
    );
  }
}

export default GroupsListPanel;

