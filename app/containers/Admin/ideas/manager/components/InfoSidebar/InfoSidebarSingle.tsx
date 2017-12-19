import * as React from 'react';
import { flow } from 'lodash';
import { IIdeaData, ideaByIdStream, deleteIdea } from 'services/ideas';
import { injectResource, InjectedResourceLoaderProps } from '../../resourceLoader';
import { browserHistory } from 'react-router';

import T from 'components/T';
import { Segment, Header, Divider, Icon, Button, Menu } from 'semantic-ui-react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

import messages from '../../messages';


interface Props {
  idea: IIdeaData;
}

class InfoSidebarSingle extends React.Component<Props & InjectedResourceLoaderProps<IIdeaData> & InjectedIntlProps> {

  handleClickDelete = () => {
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);
    if (window.confirm(message)) {
      if (this.props.idea) {
        deleteIdea(this.props.idea.id);
      }
    }
  }

  handleClickEdit = () => {
    if (this.props.idea) {
      browserHistory.push(`/ideas/edit/${this.props.idea.id}`);
    }
  }

  render() {
    const { idea } = this.props;
    if (!idea) return null;

    return (
      <div>
        <Button.Group attached="top" size="small">
          <Button onClick={this.handleClickEdit}>
            <Icon name="edit" />
            <FormattedMessage {...messages.edit} />
          </Button>
          <Button negative={true} onClick={this.handleClickDelete}>
            <Icon name="trash" />
            <FormattedMessage {...messages.delete} />
          </Button>
        </Button.Group>
        <Segment attached="bottom">
          <Header as="h5">
            <T value={idea.attributes.title_multiloc} />
          </Header>
          <p>
            <T value={idea.attributes.body_multiloc} />
          </p>
        </Segment>
      </div>
    );
  }
}

export default flow(
  injectResource('idea', ideaByIdStream, (props) => props.ideaId),
  injectIntl)
(InfoSidebarSingle);
