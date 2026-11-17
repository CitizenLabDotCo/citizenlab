import React, { PureComponent } from 'react';

import { Dropdown } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import { ManagerType } from '../../';
import messages from '../../messages';

import ExportButtons from './ExportButtons';

const DropdownButton = styled(ButtonWithLink)``;

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

export type exportType = 'selected_posts' | 'project' | 'all';

export interface Props {
  type: ManagerType;
  /** A set of ids of ideas that are currently selected */
  selection: Set<string>;
  selectedProject?: string | undefined;
  className?: string;
}

type State = {
  dropdownOpened: boolean;
};

export default class ExportMenu extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dropdownOpened: false,
    };
  }

  getExportQueryParameters = () => {
    const { selection, selectedProject } = this.props;

    let exportQueryParameter;
    let exportType: null | exportType = null;
    if (selection.size > 0) {
      exportQueryParameter = [...selection];
      exportType = 'selected_posts';
    } else if (selectedProject) {
      exportQueryParameter = selectedProject;
      exportType = 'project';
    } else {
      exportQueryParameter = 'all';
      exportType = 'all';
    }

    return { exportQueryParameter, exportType };
  };

  toggleDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState(({ dropdownOpened }) => ({
      dropdownOpened: !dropdownOpened,
    }));
  };

  render() {
    const { className, type } = this.props;
    const { dropdownOpened } = this.state;
    const { exportQueryParameter, exportType } =
      this.getExportQueryParameters();

    return (
      <Container className={className}>
        <DropdownButton
          buttonStyle="admin-dark-text"
          onClick={this.toggleDropdown}
          icon="download"
          iconPos="left"
          padding="0px"
        >
          <FormattedMessage {...messages.exports} />
        </DropdownButton>

        <Dropdown
          width="100%"
          top="35px"
          right="-5px"
          mobileRight="-5px"
          opened={dropdownOpened}
          onClickOutside={this.toggleDropdown}
          content={
            <ExportButtons
              type={type}
              exportQueryParameter={exportQueryParameter}
              exportType={exportType}
            />
          }
        />
      </Container>
    );
  }
}
