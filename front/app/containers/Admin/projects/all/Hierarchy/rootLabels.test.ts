import allMessages from '../messages';

import messages from './messages';
import { getRootLabels } from './rootLabels';

describe('getRootLabels', () => {
  it('gives admins plain group names', () => {
    expect(getRootLabels({ seesAll: true, hasContainers: true })).toEqual({
      spaces: allMessages.spaces,
      folders: allMessages.folders,
      projects: allMessages.projects,
    });
  });

  it('calls a manager’s loose projects their other projects when they also manage a space or folder', () => {
    expect(getRootLabels({ seesAll: false, hasContainers: true })).toEqual({
      spaces: messages.yourSpaces,
      folders: messages.yourFolders,
      projects: messages.otherProjectsYouManage,
    });
  });

  it('calls them "Your projects" for someone who only manages projects', () => {
    expect(
      getRootLabels({ seesAll: false, hasContainers: false }).projects
    ).toBe(messages.yourProjects);
  });
});
