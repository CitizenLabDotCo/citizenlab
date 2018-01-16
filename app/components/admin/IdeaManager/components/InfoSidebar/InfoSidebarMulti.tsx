import * as React from 'react';

import InfoSidebarMultiItem from './InfoSidebarMultiItem';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { deleteIdea } from 'services/ideas';


import { Segment, List, Button, Icon } from 'semantic-ui-react';

import messages from '../../messages';

interface Props {
  ideaIds: string[];
}

class InfoSidebarMulti extends React.Component<Props & InjectedIntlProps> {

  handleClickDelete = () => {
    const message = this.props.intl.formatMessage(messages.deleteIdeasConfirmation, { count: this.props.ideaIds.length });
    if (window.confirm(message)) {
      this.props.ideaIds.forEach((id) => {
        deleteIdea(id);
      });
    }
  }

  render() {
    const { ideaIds } = this.props;

    return (
      <div>
        <Button.Group size="small" attached="top">
          <Button negative={true} basic={true} onClick={this.handleClickDelete}>
            <Icon name="trash" />
            <FormattedMessage {...messages.deleteAll} />
          </Button>
        </Button.Group>
        <Segment attached="bottom">
          <List bulleted={true}>
            {ideaIds.map((ideaId) => (
              <InfoSidebarMultiItem key={ideaId} ideaId={ideaId} />
            ))}
          </List>
        </Segment>
      </div>
    );
  }
}

export default injectIntl(InfoSidebarMulti);
