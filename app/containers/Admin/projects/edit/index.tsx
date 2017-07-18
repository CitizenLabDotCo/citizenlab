// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { observeProject, IProjectData } from 'services/projects';


// Localisation
import { FormattedMessage } from 'react-intl';
import t from 'utils/containers/t';
const T = t;
import messages from '../messages';

// Component typing
type Props = {
};

type State = {
  project: IProjectData | null,
};

export default class AdminProjectEdition extends React.Component<Props, State> {
  subscription: Rx.Subscription;

  constructor() {
    super();

    console.log('constructor');

    this.state = {
      project: null,
    };
  }

  componentDidMount() {
    console.log('did mount');
    this.subscription = observeProject('5eb0322c-d6ac-4100-b50e-354f13b119d1').observable.subscribe((project) => {
      console.log(project);
      this.setState({ project: project.data });
    });

  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return(
      <div> Data here </div>
    );
  }
}
