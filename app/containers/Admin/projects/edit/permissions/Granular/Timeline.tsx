import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Collapse from 'components/admin/Collapse';
import ActionsForm from './ActionsForm';

// services
import { IPermissionData, updatePhasePermission } from 'services/participationContextPermissions';

// resources
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetPhasePermissions from 'resources/GetPhasePermissions';

// i18n
import T from 'components/T';

// styling
import styled from 'styled-components';

const Permissions = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

interface InputProps { }

interface DataProps {
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  openedPhase: string | null;
}

class Timeline extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      openedPhase: null,
    };
  }

  handleCollapseToggle = (phaseId: string) => () => {
    const { openedPhase } = this.state;
    this.setState({ openedPhase: openedPhase === phaseId ? null : phaseId });
  }

  handlePermissionChange = (permission: IPermissionData, permittedBy: IPermissionData['attributes']['permitted_by'], groupIds: string[]) => {
    updatePhasePermission(
      permission.id,
      permission.relationships.permittable.data.id,
      permission.attributes.action,
      { permitted_by: permittedBy, group_ids: groupIds }
    );
  }

  render() {
    const { phases } = this.props;
    const { openedPhase } = this.state;

    return (
      <div>
        {phases && phases.map((phase) => (
          <Collapse
            key={phase.id}
            opened={openedPhase === phase.id}
            onToggle={this.handleCollapseToggle(phase.id)}
            label={<T value={phase.attributes.title_multiloc} />}
          >
            <Permissions>
              <GetPhasePermissions phaseId={phase.id}>
                {(permissions) => isNilOrError(permissions) ? null :
                  <ActionsForm
                    permissions={permissions}
                    onChange={this.handlePermissionChange}
                  />
                }
              </GetPhasePermissions>
            </Permissions>
          </Collapse>
        ))}
      </div>
    );
  }
}

export default (inputProps) => (
  <GetPhases projectId={inputProps.projectId}>
    {(phases) => <Timeline {...inputProps} phases={phases} />}
  </GetPhases>
);
