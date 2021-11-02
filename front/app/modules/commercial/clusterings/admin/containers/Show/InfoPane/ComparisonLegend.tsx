import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Node } from '../../../../services/clusterings';
import GetIdea from 'resources/GetIdea';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';
import GetProject from 'resources/GetProject';
import GetTopic from 'resources/GetTopic';

const Container = styled.div`
  width: 280px;
  margin: 0 0 10px 20px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ColorIndicator: any = styled.div`
  flex: 0 0 1.2rem;
  height: 1.2rem;
  margin: 0.2rem 1rem 0.2rem 0;
  background-color: ${(props) =>
    (props as any).theme.comparisonColors[(props as any).index]};
`;

const TitleContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h3`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const LegendTitle = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

type Props = {
  selectedNodes: Node[][];
};

interface State {}

class ComparisonLegend extends PureComponent<Props, State> {
  selectionTitle = (nodes: Node[]) => {
    const node = nodes[0];
    if (!node) return null;

    switch (node.type) {
      case 'idea':
        return (
          <GetIdea ideaId={node.id}>
            {(idea) =>
              isNilOrError(idea) ? null : (
                <T value={idea && idea.attributes.title_multiloc} />
              )
            }
          </GetIdea>
        );
      case 'project':
        return (
          <GetProject projectId={node.id}>
            {(project) =>
              isNilOrError(project) ? null : (
                <T value={project && project.attributes.title_multiloc} />
              )
            }
          </GetProject>
        );
      case 'topic':
        return (
          <GetTopic id={node.id}>
            {(topic) =>
              isNilOrError(topic) ? null : (
                <T value={topic && topic.attributes.title_multiloc} />
              )
            }
          </GetTopic>
        );
      case 'custom':
        return (
          <span>
            {node.title ||
              (node.keywords && node.keywords.map((k) => k.name).join(' '))}
          </span>
        );
      default:
        return null;
    }
  };

  render() {
    const { selectedNodes } = this.props;

    return (
      <Container>
        {selectedNodes.length === 1 && (
          <Title>{this.selectionTitle(selectedNodes[0])}</Title>
        )}

        {selectedNodes.length > 1 &&
          selectedNodes.map((nodes, index) => (
            <Row key={index}>
              <ColorIndicator index={index} />
              <TitleContainer>
                <LegendTitle>{this.selectionTitle(nodes)}</LegendTitle>
              </TitleContainer>
            </Row>
          ))}
      </Container>
    );
  }
}

export default ComparisonLegend;
