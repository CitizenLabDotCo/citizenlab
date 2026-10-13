import { getNewIdsOnDrop } from './utils';

describe('getNewIdsOnDrop', () => {
  it('works if you drag an item to the end', () => {
    const ids = ['a', 'b', 'c'];
    const draggedItemId = 'a';
    const targetIndex = 2;

    expect(getNewIdsOnDrop(ids, draggedItemId, targetIndex)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('works if you drag an item to the beginning', () => {
    const ids = ['a', 'b', 'c'];
    const draggedItemId = 'c';
    const targetIndex = 0;

    expect(getNewIdsOnDrop(ids, draggedItemId, targetIndex)).toEqual([
      'c',
      'a',
      'b',
    ]);
  });

  it('works if you keep an item in place', () => {
    const ids = ['a', 'b', 'c'];
    const draggedItemId = 'b';
    const targetIndex = 1;

    expect(getNewIdsOnDrop(ids, draggedItemId, targetIndex)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
