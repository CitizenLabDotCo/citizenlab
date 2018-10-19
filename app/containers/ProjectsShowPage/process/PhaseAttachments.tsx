import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import FileAttachments from 'components/UI/FileAttachments';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';

interface InputProps {
  phaseId: string | null;
}

interface DataProps {
  phase: GetPhaseChildProps;
  phaseFiles: GetResourceFilesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PhaseAttachments extends PureComponent<Props, State> {
  render() {
    const { phase, phaseFiles } = this.props;

    if (!isNilOrError(phase) && !isNilOrError(phaseFiles) && !isEmpty(phaseFiles)) {
      return (
        <FileAttachments
          className={this.props['className']}
          files={phaseFiles}
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
  phaseFiles: ({ phaseId, render }) => <GetResourceFiles resourceType="phase" resourceId={phaseId}>{render}</GetResourceFiles>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PhaseAttachments {...inputProps} {...dataProps} />}
  </Data>
);
