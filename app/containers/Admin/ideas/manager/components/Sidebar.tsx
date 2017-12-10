import * as React from 'react';
import { Tab } from 'semantic-ui-react';

interface Props {

}

const panes = [
  { menuItem: 'Phases', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
  { menuItem: 'Topics', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
];

export default class Sidebar extends React.Component<Props> {
  render() {
    return (
      <Tab panes={panes} />
    );
  }
}
