// Libraries
import * as React from 'react';
import { Subscription } from 'rxjs';

// services
import { ideaActivities, IdeaActivity } from 'services/ideas';

// Components
import ActivitiesChangeLog from './ActivitiesChangelog';
import Modal from 'components/UI/Modal';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

const LinkButton = styled.button`
  background: none;
  border: 0;
  color: inherit;
  display: inline;
  margin: 0;
  padding: 0;
`;

const Title = styled.h1`
  margin-bottom: 60px;
`;

// Typing
interface Props {
  ideaId: string;
}

interface State {
  activities: IdeaActivity[];
  modalOpen: boolean;
}

class IdeaActivities extends React.Component<Props, State> {
  subs: Subscription[] = [];

  constructor(props) {
    super(props);

    this.state = {
      activities: [],
      modalOpen: false,
    };
  }

  componentWillMount() {
    this.subs.push(ideaActivities(this.props.ideaId).observable.subscribe((response) => {
      this.setState({ activities: response.data });
    }));
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  openModal = () => {
    this.setState({ modalOpen: true });
  }

  closeModal = () => {
    this.setState({ modalOpen: false });
  }

  render() {
    if (this.state.activities.length) {
      const lastUpdated = this.state.activities[0].attributes.acted_at;

      return (
        <React.Fragment>
          <span> - <LinkButton onClick={this.openModal}>
            <FormattedMessage {...messages.lastUpdated} values={{ modificationTime: <FormattedRelative value={lastUpdated} /> }} />
          </LinkButton></span>
          <Modal opened={this.state.modalOpen} close={this.closeModal} >
            <Title><FormattedMessage {...messages.lastChangesTitle} /></Title>
            {this.state.activities.map((activity) => (
              <ActivitiesChangeLog key={activity.id} activity={activity} />
            ))}
          </Modal>
        </React.Fragment>
      );
    } else {
      return null;
    }
  }
}

export default IdeaActivities;
