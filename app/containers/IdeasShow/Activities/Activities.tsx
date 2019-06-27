// Libraries
import React, { PureComponent } from 'react';

// resourcs
import GetIdeaActivities, { GetIdeaActivitiesChildProps } from 'resources/GetIdeaActivities';

// Components
import ActivitiesChangeLog from './ActivitiesChangelog';
import Modal from 'components/UI/Modal';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

const LinkButton = styled.button`
  background: none;
  border: 0;
  color: inherit;
  display: inline;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const Activities = styled.div`
  padding: 30px;
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  ideaActivities: GetIdeaActivitiesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  modalOpen: boolean;
}

class IdeaActivities extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false
    };
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  openModal = () => {
    this.setState({ modalOpen: true });
  }

  closeModal = () => {
    this.setState({ modalOpen: false });
  }

  render() {
    const { ideaActivities } = this.props;

    // Render only if there is more than the "published" activity
    if (ideaActivities && ideaActivities.length > 0 && (ideaActivities.length > 1 || ideaActivities[0].attributes.action !== 'published')) {
      const lastUpdated = ideaActivities[0].attributes.acted_at;

      return (
        <>
          <span> - <LinkButton onMouseDown={this.removeFocus} onClick={this.openModal} className="e2e-idea-last-modified-button">
            <FormattedMessage {...messages.lastUpdated} values={{ modificationTime: <FormattedRelative value={lastUpdated} /> }} />
          </LinkButton></span>

          <Modal
            opened={this.state.modalOpen}
            close={this.closeModal}
            header={<FormattedMessage {...messages.lastChangesTitle} />}
            fixedHeight={true}
          >
            <Activities className="e2e-activities-changelog">
              {ideaActivities.map((activity) => (
                <ActivitiesChangeLog key={activity.id} activity={activity} />
              ))}
            </Activities>
          </Modal>
        </>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetIdeaActivities ideaId={inputProps.ideaId}>
    {ideaActivities => <IdeaActivities {...inputProps} ideaActivities={ideaActivities} />}
  </GetIdeaActivities>
);
