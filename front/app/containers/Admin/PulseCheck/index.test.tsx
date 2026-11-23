import React from 'react';

import { pageChanges$ } from 'utils/analytics';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { act, render } from 'utils/testUtils/rtl';

import PulseCheck from './index';

const mockShowNext = jest.fn();
let mockIsRedesign = false;

jest.mock('api/pulse_checks/useShowNextPulseCheck', () => () => ({
  mutateAsync: mockShowNext,
}));
jest.mock('hooks/useProjectBackofficeRedesign', () => () => mockIsRedesign);
jest.mock('utils/analytics', () => {
  const { Subject } = jest.requireActual<typeof import('rxjs')>('rxjs');
  return { pageChanges$: new Subject() };
});
jest.mock('utils/getRoutePattern', () => ({
  getRoutePattern: (path: string) =>
    path.includes('/projects/p1')
      ? '/:locale/admin/projects/:projectId/general'
      : '/:locale/admin/projects',
}));

describe('PulseCheck triggers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-14T00:00:00Z'));
    queryClient.clear();
    sessionStorage.clear();
    mockShowNext.mockReset().mockResolvedValue(null);
    mockIsRedesign = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('preserves the visit duration when the back-office version changes', async () => {
    window.history.replaceState({}, '', '/en/admin/projects/p1/general');
    const { rerender } = render(<PulseCheck />);
    act(() => {
      jest.advanceTimersByTime(20000);
    });
    mockIsRedesign = true;
    rerender(<PulseCheck />);
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    await act(async () => {
      window.history.replaceState({}, '', '/en/admin/projects');
      pageChanges$.next({ path: '/en/admin/projects' });
    });
    expect(mockShowNext).toHaveBeenCalledWith({
      trigger: 'project_exit',
      uiVersion: 'project_backoffice_v2',
      adminArea: '/:locale/admin/projects/:projectId/general',
      projectId: 'p1',
    });
  });

  it('does not check feedback after a save outside a project', async () => {
    window.history.replaceState({}, '', '/en/admin/projects');
    render(<PulseCheck />);
    await act(async () => {
      await queryClient
        .getMutationCache()
        .build(queryClient, { mutationFn: async () => null })
        .execute(undefined);
    });
    expect(mockShowNext).not.toHaveBeenCalled();
  });

  it('includes the current project when checking after a save', async () => {
    window.history.replaceState({}, '', '/en/admin/projects/p1/general');
    render(<PulseCheck />);
    await act(async () => {
      await queryClient
        .getMutationCache()
        .build(queryClient, { mutationFn: async () => null })
        .execute(undefined);
    });
    expect(mockShowNext).toHaveBeenCalledWith({
      trigger: 'save',
      uiVersion: 'project_backoffice_v1',
      adminArea: '/:locale/admin/projects/:projectId/general',
      projectId: 'p1',
    });
  });
});
