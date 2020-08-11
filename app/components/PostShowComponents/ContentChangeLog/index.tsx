// Libraries
import React, { PureComponent } from 'react';

// resourcs
import GetIdeaActivities, {
  GetIdeaActivitiesChildProps,
} from 'resources/GetIdeaActivities';
import GetInitiativeActivities, {
  GetInitiativeActivitiesChildProps,
} from 'resources/GetInitiativeActivities';

// Components
import Entry from './ChangeLogEntry';
import Modal from 'components/UI/Modal';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Separator = styled.span`
  margin-left: 4px;
  margin-right: 4px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const LinkButton = styled.button`
  background: none;
  border: 0;
  color: inherit;
  text-decoration: underline;
  text-align: left;
  display: inline;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const Entries = styled.div`
  padding: 30px;
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

interface DataProps {
  postActivities:
    | GetIdeaActivitiesChildProps
    | GetInitiativeActivitiesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  modalOpen: boolean;
}

class ContentChangeLog extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  render() {
    const { postActivities, postType } = this.props;

    // Render only if there is more than the "published" activity
    if (
      postActivities &&
      postActivities.length > 0 &&
      (postActivities.length > 1 ||
        postActivities[0].attributes.action !== 'published')
    ) {
      const lastUpdated = postActivities[0].attributes.acted_at;
      const lastChangesTitleMessage =
        postType === 'idea'
          ? messages.lastChangesTitleIdea
          : messages.lastChangesTitleInitiative;

      return (
        <Container className={this.props.className}>
          <Separator>-</Separator>
          <LinkButton
            onMouseDown={this.removeFocus}
            onClick={this.openModal}
            className="e2e-post-last-modified-button"
          >
            <FormattedMessage
              {...messages.lastUpdated}
              values={{
                modificationTime: <FormattedRelative value={lastUpdated} />,
                translatedPostType: (
                  <FormattedMessage {...messages[postType]} />
                ),
              }}
            />
          </LinkButton>

          <Modal
            opened={this.state.modalOpen}
            close={this.closeModal}
            header={<FormattedMessage {...lastChangesTitleMessage} />}
            fixedHeight={true}
          >
            <Entries className="e2e-activities-changelog">
              {postActivities.map((activity) => (
                <Entry
                  key={activity.id}
                  activity={activity}
                  postType={postType}
                />
              ))}
            </Entries>
          </Modal>
        </Container>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) =>
  inputProps.postType === 'idea' ? (
    <GetIdeaActivities ideaId={inputProps.postId}>
      {(postActivities) => (
        <ContentChangeLog {...inputProps} postActivities={postActivities} />
      )}
    </GetIdeaActivities>
  ) : (
    <GetInitiativeActivities initiativeId={inputProps.postId}>
      {(postActivities) => (
        <ContentChangeLog {...inputProps} postActivities={postActivities} />
      )}
    </GetInitiativeActivities>
  );
