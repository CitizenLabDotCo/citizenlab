import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { deleteIdea } from 'services/ideas';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import clHistory from 'utils/cl-router/history';
import eventEmitter from 'utils/eventEmitter';
import { IModalInfo } from 'containers/App';
import T from 'components/T';
import { Segment, Header } from 'semantic-ui-react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

const StyledLink = styled.a`
  cursor: pointer;
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

class InfoSidebarSingle extends React.PureComponent<Props & InjectedIntlProps> {

  handleClickDelete = () => {
    const { idea } = this.props;
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);

    if (window.confirm(message) && !isNilOrError(idea)) {
      deleteIdea(idea.id);
    }
  }

  handleClickEdit = () => {
    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      clHistory.push(`/ideas/edit/${idea.id}`);
    }
  }

  handleClickShow = () => {
    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IModalInfo>('adminIdeas', 'cardClick', {
        type: 'idea',
        id: idea.id,
        url: `/ideas/${idea.attributes.slug}`
      });
    }
  }

  render() {
    const { idea } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <Segment attached="bottom">
        <StyledLink onClick={this.handleClickShow} role="navigation">
          <Header as="h5">
            <T value={idea.attributes.title_multiloc} />
          </Header>
        </StyledLink>
        <p>
          <T value={idea.attributes.body_multiloc} supportHtml={true} />
        </p>
      </Segment>
    );
  }
}

const InfoSidebarSingleWithInjectedIntl = injectIntl<Props>(InfoSidebarSingle);

export default (inputProps: InputProps) => (
  <GetIdea id={inputProps.ideaId}>
    {idea =>  <InfoSidebarSingleWithInjectedIntl {...inputProps} idea={idea} />}
  </GetIdea>
);
