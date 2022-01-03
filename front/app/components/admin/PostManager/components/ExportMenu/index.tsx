import React, { PureComponent } from 'react';

// components
import { Dropdown } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import ExportButtons from './ExportButtons';

// style
import styled from 'styled-components';

// typings
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { ManagerType } from '../../';

const DropdownButton = styled(Button)``;

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
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  selectedProject: string | undefined;
  className?: string;
}

type State = {
  dropdownOpened: boolean;
};

export default class ExportMenu extends PureComponent<Props, State> {
  constructor(props) {
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
    const {
      exportQueryParameter,
      exportType,
    } = this.getExportQueryParameters();

    return (
      <Container className={className}>
        <DropdownButton
          buttonStyle="admin-dark-text"
          onClick={this.toggleDropdown}
          icon="download"
          iconPos="right"
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
