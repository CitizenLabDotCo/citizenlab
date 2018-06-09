import { flatten } from 'lodash';

interface BaseNode {
  id: string;
}

interface ProjectNode extends BaseNode {
  type: 'project';
  children: Node[];
}

interface TopicNode extends BaseNode {
  type: 'topic';
  children: Node[];
}

interface CustomNode extends BaseNode {
  type: 'custom';
  title?: string;
  children: Node[];
}

interface IdeaNode extends BaseNode {
  type: 'idea';
}

export type ParentNode = ProjectNode | TopicNode | CustomNode;

export type Node = ParentNode | IdeaNode;


export const ideasUnder = (node: Node): string[] => {
  if (node.type === 'idea') {
    return [node.id];
  } else {
    return flatten(node.children.map((c) => ideasUnder(c)));
  }
};

