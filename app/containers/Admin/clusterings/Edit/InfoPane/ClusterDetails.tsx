import React, { PureComponent } from 'react';
import T from 'components/T';
import GetIdea from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';
import { ParentNode } from 'services/clusterings';
import styled from 'styled-components';
import { fontSize } from 'utils/styleUtils';

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
  font-size: ${fontSize('base')};
  padding-top: 5px;
  padding-bottom: 5px;
`;

class ClusterDetails extends PureComponent<Props> {

  render() {
    const { ideaIds, node } = this.props;

    if (!node) return null;

    return (
      <Container className={this.props['className']}>
        <h3>The selected cluster contains the following ideas:</h3>
        {/* {node.type === 'custom' && node.title &&
          <h3>
            {node.title}
          </h3>
        } */}
        <List>
          {ideaIds.map((id) => (
            <GetIdea key={id} id={id}>
              {(idea) => isNilOrError(idea) ? null : (
                <ListItem key={idea.id}>
                  <T value={idea.attributes.title_multiloc} />
                </ListItem>
              )}
            </GetIdea>
          ))}
        </List>
      </Container>
    );
  }
}

export default ClusterDetails;
