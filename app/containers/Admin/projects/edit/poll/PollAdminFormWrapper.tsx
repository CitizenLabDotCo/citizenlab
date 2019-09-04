import React, { PureComponent } from 'react';

interface Props {
  id: string;
  type: 'projects' | 'phases';
}

class PollAdminFormWrapper extends PureComponent<Props> {

  render() {
    return (
      <div> Form goes here</div>
    );
  }

}

export default PollAdminFormWrapper;
