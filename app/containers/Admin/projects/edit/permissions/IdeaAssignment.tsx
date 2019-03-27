import React from 'react';
import { adopt } from 'react-adopt';

// resources
import GetModerators, { GetModeratorsChildProps } from 'resources/GetModerators';

interface InputProps {
  projectId: string;
}

interface DataProps {
  moderators: GetModeratorsChildProps;
}

interface Props extends InputProps {}

class IdeaAssignment extends React.PureComponent<Props> {
  render() {
    return (<div>test</div>);
  }
}

const Data = adopt<DataProps, InputProps>({
  moderators: ({ projectId }) => <GetModerators projectId={projectId} />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <IdeaAssignment {...inputProps} {...dataprops} />}
  </Data>
);
