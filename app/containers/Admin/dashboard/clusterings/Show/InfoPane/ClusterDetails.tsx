import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';
import { ParentNode } from 'services/clusterings';
import GetIdea from 'resources/GetIdea';

import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from '../../messages';

type Props = {
  ideaIds: string[];
  node: ParentNode;
};

const Container = styled.div``;

const List = styled.ul`
  padding: 0;
  padding-left: 20px;
  padding-right: 20px;
  margin: 0;
`;

const ListItem = styled.li`
  font-size: ${fontSizes.base}px;
  padding-top: 5px;
  padding-bottom: 5px;
`;

class ClusterDetails extends PureComponent<Props> {
  keywords = (): { name: string }[] => {
    const { node } = this.props;
    return (node.type === 'custom' && node.keywords) || [];
  };

  render() {
    const { ideaIds, node } = this.props;

    if (!node) return null;

    const keywords = this.keywords();

    return (
      <Container className={this.props['className']}>
        {!isEmpty(keywords) && (
          <>
            <h4>
              <FormattedMessage {...messages.keywords} />
            </h4>
            <List>
              {keywords.map((kw) => (
                <ListItem key={kw.name}>{kw.name}</ListItem>
              ))}
            </List>
          </>
        )}
        <h4>
          <FormattedMessage {...messages.clusterContainsSelectedInputs} />
        </h4>
        <List>
          {ideaIds.map((id) => (
            <GetIdea key={id} ideaId={id}>
              {(idea) =>
                isNilOrError(idea) ? null : (
                  <ListItem key={idea.id}>
                    <T value={idea.attributes.title_multiloc} />
                  </ListItem>
                )
              }
            </GetIdea>
          ))}
        </List>
      </Container>
    );
  }
}

export default ClusterDetails;
