import { fromJS } from 'immutable';
// import { makeSelectDownVotes, makeSelectUpVotes } from '../selectors';
// import { generateResourcesVoteValue } from './__shared';

// describe('IdeasShow selectors', () => {
//   describe('makeSelectUpVotes', () => {
//     const testVotesSelector = (mode) => {
//       const votesSelector = (mode === 'up'
//         ? makeSelectUpVotes()
//         : makeSelectDownVotes()
//       );

//       const state = {
//         // page name nested for proper conversion by fromJS
//         ideasShow: {
//           votes: [],
//         },
//         resources: {
//           votes: [],
//         },
//       };

//       let i = 0;
//       while (i < 1) {
//         if (i % 2 === 0) {
//           state.ideasShow.votes.push(i);
//         }
//         state.resources.votes[i] = generateResourcesVoteValue(i, mode === 'up', mode === 'down').data;

//         i += 1;
//       }

//       expect(votesSelector(fromJS(state))).toEqual(state.resources.votes);
//     };

//     it('should select up votes', () => {
//       testVotesSelector('up');
//     });
//   });
// });

import { arrayToTree } from '../selectors';

// export const arrayToTree = (ids, comments) => {
//   const map = {};
//   const roots = [];

//   ids.forEach((id) => {
//     const parentId = comments.get(id).getIn(['relationships', 'parent', 'data', 'id']);
//     const node = { id, children: [] };
//     map[id] = node;

//     if (!parentId) return roots.push(node);
//     if (map[parentId]) map[parentId].children.push(node);
//     return '';
//   });

//   return roots;
// };

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
    expect(tree).toEqual([r1]);
  });
});
