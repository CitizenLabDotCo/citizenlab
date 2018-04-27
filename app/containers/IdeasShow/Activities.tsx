// Libraries
import React from 'react';

// resourcs
import GetIdeaActivities, { GetIdeaActivitiesChildProps } from 'resources/GetIdeaActivities';

// Components
import ActivitiesChangeLog from './ActivitiesChangelog';
import Modal from 'components/UI/Modal';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

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

class IdeaActivities extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalOpen: false
    };
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
          <span> - <LinkButton onClick={this.openModal}>
            <FormattedMessage {...messages.lastUpdated} values={{ modificationTime: <FormattedRelative value={lastUpdated} /> }} />
          </LinkButton></span>
          <Modal opened={this.state.modalOpen} close={this.closeModal} >
            <Title><FormattedMessage {...messages.lastChangesTitle} /></Title>
            {ideaActivities.map((activity) => (
              <ActivitiesChangeLog key={activity.id} activity={activity} />
            ))}
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
