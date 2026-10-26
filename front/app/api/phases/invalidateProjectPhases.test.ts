import { QueryClient } from '@tanstack/react-query';

import phasesMiniKeys from 'api/phases_mini/keys';

import { invalidateProjectPhases } from './invalidateProjectPhases';
import phasesKeys from './keys';

const phaseOf = (projectId: string) => ({
  data: { relationships: { project: { data: { id: projectId } } } },
});

describe('invalidateProjectPhases', () => {
  it('only invalidates the cached phases of the given project', () => {
    const queryClient = new QueryClient();
    const keys = {
      list: phasesKeys.list({ projectId: 'p1' }),
      listWithPlacement: phasesKeys.list({
        projectId: 'p1',
        placementType: 'standalone',
      }),
      otherList: phasesKeys.list({ projectId: 'p2' }),
      item: phasesKeys.item({ phaseId: 'a' }),
      otherItem: phasesKeys.item({ phaseId: 'b' }),
      mini: phasesMiniKeys.item({ id: 'a' }),
      otherMini: phasesMiniKeys.item({ id: 'b' }),
    };
    queryClient.setQueryData(keys.list, { data: [] });
    queryClient.setQueryData(keys.listWithPlacement, { data: [] });
    queryClient.setQueryData(keys.otherList, { data: [] });
    queryClient.setQueryData(keys.item, phaseOf('p1'));
    queryClient.setQueryData(keys.otherItem, phaseOf('p2'));
    queryClient.setQueryData(keys.mini, phaseOf('p1'));
    queryClient.setQueryData(keys.otherMini, phaseOf('p2'));

    invalidateProjectPhases(queryClient, 'p1');

    const isInvalidated = (key: readonly unknown[]) =>
      queryClient.getQueryState(key)?.isInvalidated;
    expect(isInvalidated(keys.list)).toBe(true);
    expect(isInvalidated(keys.listWithPlacement)).toBe(true);
    expect(isInvalidated(keys.item)).toBe(true);
    expect(isInvalidated(keys.mini)).toBe(true);
    expect(isInvalidated(keys.otherList)).toBe(false);
    expect(isInvalidated(keys.otherItem)).toBe(false);
    expect(isInvalidated(keys.otherMini)).toBe(false);
  });
});
