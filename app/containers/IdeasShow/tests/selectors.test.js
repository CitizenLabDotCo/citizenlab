import { fromJS } from 'immutable';
import { arrayToTree } from '../selectors';

describe('IdeasShow selector helper arrayToTree', () => {
  it('should trasform an array of elements; that only have none or one childre, and with only one root element into the proper tree shape', () => {
    const ids = fromJS(['1', '2', '3']);
    const commnets = fromJS({
      1: { id: 1 },
      2: { id: 2, relationships: { parent: { data: { id: 1 } } } },
      3: { id: 3, relationships: { parent: { data: { id: 2 } } } },
    });
    const r0c0c0 = { id: '3', children: [] };
    const r0c0 = { id: '2', children: [r0c0c0] };
    const r0 = { id: '1', children: [r0c0] };

    const tree = arrayToTree(ids, commnets);
    expect(tree).toEqual([r0]);
  });

  it('should trasform an array of elements; that only have none or one childre, and with 2 root elements into the proper tree shape', () => {
    const ids = fromJS(['1', '2', '3', 'a', 'b', 'c']);
    const commnets = fromJS({
      1: { id: 1 },
      2: { id: 2, relationships: { parent: { data: { id: 1 } } } },
      3: { id: 3, relationships: { parent: { data: { id: 2 } } } },
      a: { id: 'a' },
      b: { id: 'b', relationships: { parent: { data: { id: 'a' } } } },
      c: { id: 'c', relationships: { parent: { data: { id: 'b' } } } },
    });

    const r0c0c0 = { id: '3', children: [] };
    const r0c0 = { id: '2', children: [r0c0c0] };
    const r0 = { id: '1', children: [r0c0] };

    const r1c0c0 = { id: 'c', children: [] };
    const r1c0 = { id: 'b', children: [r1c0c0] };
    const r1 = { id: 'a', children: [r1c0] };


    const tree = arrayToTree(ids, commnets);
    expect(tree).toEqual([r0, r1]);
  });

  it('should trasform an array of elements; that only have none or one childre and multiple grand childre, and with 2 root elements into the proper tree shape', () => {
    const ids = fromJS(['1', '2', '3', '4', 'a', 'b', 'c', 'd', 'e', 'f']);
    const commnets = fromJS({
      1: { id: 1 },
      2: { id: 2, relationships: { parent: { data: { id: 1 } } } },
      3: { id: 3, relationships: { parent: { data: { id: 2 } } } },
      4: { id: 4, relationships: { parent: { data: { id: 2 } } } },

      a: { id: 'a' },
      b: { id: 'b', relationships: { parent: { data: { id: 'a' } } } },
      c: { id: 'c', relationships: { parent: { data: { id: 'b' } } } },
      d: { id: 'd', relationships: { parent: { data: { id: 'b' } } } },
      e: { id: 'e', relationships: { parent: { data: { id: 'b' } } } },
      f: { id: 'f', relationships: { parent: { data: { id: 'b' } } } },

    });

    const r0c0c1 = { id: '4', children: [] };
    const r0c0c0 = { id: '3', children: [] };
    const r0c0 = { id: '2', children: [r0c0c0, r0c0c1] };
    const r0 = { id: '1', children: [r0c0] };

    const r1c0c0 = { id: 'c', children: [] };
    const r1c0c1 = { id: 'd', children: [] };
    const r1c0c2 = { id: 'e', children: [] };
    const r1c0c3 = { id: 'f', children: [] };

    const r1c0 = { id: 'b', children: [r1c0c0, r1c0c1, r1c0c2, r1c0c3] };
    const r1 = { id: 'a', children: [r1c0] };


    const tree = arrayToTree(ids, commnets);
    expect(tree).toEqual([r0, r1]);
  });

  it('should trasform an array of elements; with nodes with multiple nodes with  multiple children into the proper tree shape', () => {
    const ids = fromJS(['1', '2', '20', '200', '201', '21', '3', '4', 'a', 'b', 'c', 'd', 'e', 'f']);
    const commnets = fromJS({
      1: { id: 1 },
      2: { id: 2, relationships: { parent: { data: { id: 1 } } } },
      20: { id: 20, relationships: { parent: { data: { id: 1 } } } },
      200: { id: 200, relationships: { parent: { data: { id: 20 } } } },
      201: { id: 201, relationships: { parent: { data: { id: 20 } } } },
      21: { id: 21, relationships: { parent: { data: { id: 1 } } } },

      3: { id: 3, relationships: { parent: { data: { id: 2 } } } },
      4: { id: 4, relationships: { parent: { data: { id: 2 } } } },

      a: { id: 'a' },
      b: { id: 'b', relationships: { parent: { data: { id: 'a' } } } },
      c: { id: 'c', relationships: { parent: { data: { id: 'b' } } } },
      d: { id: 'd', relationships: { parent: { data: { id: 'b' } } } },
      e: { id: 'e', relationships: { parent: { data: { id: 'b' } } } },
      f: { id: 'f', relationships: { parent: { data: { id: 'b' } } } },

    });

    const r0c2 = { id: '21', children: [] };

    const r0c1c1 = { id: '201', children: [] };
    const r0c1c0 = { id: '200', children: [] };

    const r0c1 = { id: '20', children: [r0c1c0, r0c1c1] };


    const r0c0c1 = { id: '4', children: [] };
    const r0c0c0 = { id: '3', children: [] };
    const r0c0 = { id: '2', children: [r0c0c0, r0c0c1] };


    const r0 = { id: '1', children: [r0c0, r0c1, r0c2] };

    const r1c0c0 = { id: 'c', children: [] };
    const r1c0c1 = { id: 'd', children: [] };
    const r1c0c2 = { id: 'e', children: [] };
    const r1c0c3 = { id: 'f', children: [] };

    const r1c0 = { id: 'b', children: [r1c0c0, r1c0c1, r1c0c2, r1c0c3] };
    const r1 = { id: 'a', children: [r1c0] };


    const tree = arrayToTree(ids, commnets);
    expect(tree).toEqual([r0, r1]);
  });

  it('should not render a whole branch if the parent node is missing', () => {
    const ids = fromJS(['2', '20', '200', '201', '21', '3', '4', 'a', 'b', 'c', 'd', 'e', 'f']);
    const commnets = fromJS({
      1: { id: 1 },
      2: { id: 2, relationships: { parent: { data: { id: 1 } } } },

      20: { id: 20, relationships: { parent: { data: { id: 1 } } } },
      200: { id: 200, relationships: { parent: { data: { id: 20 } } } },
      201: { id: 201, relationships: { parent: { data: { id: 20 } } } },
      21: { id: 21, relationships: { parent: { data: { id: 1 } } } },

      3: { id: 3, relationships: { parent: { data: { id: 2 } } } },
      4: { id: 4, relationships: { parent: { data: { id: 2 } } } },

      a: { id: 'a' },
      b: { id: 'b', relationships: { parent: { data: { id: 'a' } } } },
      c: { id: 'c', relationships: { parent: { data: { id: 'b' } } } },
      d: { id: 'd', relationships: { parent: { data: { id: 'b' } } } },
      e: { id: 'e', relationships: { parent: { data: { id: 'b' } } } },
      f: { id: 'f', relationships: { parent: { data: { id: 'b' } } } },

    });

    const r1c0c0 = { id: 'c', children: [] };
    const r1c0c1 = { id: 'd', children: [] };
    const r1c0c2 = { id: 'e', children: [] };
    const r1c0c3 = { id: 'f', children: [] };

    const r1c0 = { id: 'b', children: [r1c0c0, r1c0c1, r1c0c2, r1c0c3] };
    const r1 = { id: 'a', children: [r1c0] };


    const tree = arrayToTree(ids, commnets);
    expect(tree).toEqual([r1]);
  });
});
