import React, { PureComponent } from 'react';
import styled from 'styled-components';

import Collapse from 'components/admin/Collapse';
import ActionsForm from './ActionsForm';

import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetPhasePermissions from 'resources/GetPhasePermissions';
import { isNilOrError } from 'utils/helperUtils';
import { IPermissionData, updatePhasePermission } from 'services/participationContextPermissions';

import T from 'components/T';

const StyledCollapse = styled(Collapse)`
  width: 100%;
`;

const InnerCollapse = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
  padding-bottom: 20px;
  justify-content: space-around;
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  phases: GetPhasesChildProps;
}
interface Props extends InputProps, DataProps {
}

interface State {
  openedPhase: string | null;
}

class TimelineGranularPermissions extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      openedPhase: null,
    };
  }

  handleCollapseToggle = (phaseId) => () => {
    const { openedPhase } = this.state;
    this.setState({ openedPhase: openedPhase === phaseId ? null : phaseId });
  }

  handlePermissionChange = (permission: IPermissionData, permittedBy: IPermissionData['attributes']['permitted_by'], groupIds: string[]) => {
    updatePhasePermission(
      permission.id,
      this.props.projectId,
      permission.relationships.permittable.data.id,
      permission.attributes.action,
      { permitted_by: permittedBy, group_ids: groupIds }
    );
  }

  render() {
    const { phases, projectId } = this.props;
    const { openedPhase } = this.state;

    return (
      <div>
        {phases && phases.map(phase => (
          <StyledCollapse
            key={phase.id}
            opened={openedPhase === phase.id}
            onToggle={this.handleCollapseToggle(phase.id)}
            label={<T value={phase.attributes.title_multiloc} />}
          >
            <InnerCollapse>
              <GetPhasePermissions projectId={projectId} phaseId={phase.id}>
                {(permissions) => isNilOrError(permissions) ? null :
                  <ActionsForm
                    permissions={permissions}
                    onChange={this.handlePermissionChange}
                  />
                }
              </GetPhasePermissions>
            </InnerCollapse>
          </StyledCollapse>
        ))}
      </div>
    );
  }
}

export default (inputProps) => (
  <GetPhases projectId={inputProps.projectId}>
    {(phases) => <TimelineGranularPermissions {...inputProps} phases={phases} />}
  </GetPhases>
);
