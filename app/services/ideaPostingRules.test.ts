import { getIdeaPostingRules } from './ideaPostingRules';

import { getMockProject } from 'services/__mocks__/projects';
import {
  mockUser,
  mockAdmin,
  mockProjectModerator,
} from 'services/__mocks__/auth';

// projects mocks continuous
const projectId = 'testProject';

// an Ideation project, with posting_enabled set to true
const ideationContinuous = getMockProject(projectId, 'continuous', 'ideation');

const getDisabledIdeationProject = (disabledReason, future_enabled) => {
  const project = getMockProject(projectId, 'continuous', 'ideation');
  const posting = {
    disabled_reason: disabledReason,
    enabled: false,
    future_enabled: future_enabled || null,
  };
  project.attributes.action_descriptor = {
    ...project.attributes.action_descriptor,
    posting,
  };
  return project;
};

// users Mocks
const mockUserData = mockUser.data;
const mockAdminData = mockAdmin.data;
const mockThisProjectModeratorData = mockProjectModerator(projectId).data;
const mockSomeProjectModeratorData = mockProjectModerator('rando446').data;

describe('getIdeaPostingRules', () => {
  describe('continuous projects', () => {
    describe('no restrictions', () => {
      it('allows unsigned users', () => {
        expect(getIdeaPostingRules({ project: ideationContinuous })).toEqual({
          show: true,
          enabled: true,
        });
      });
      it('allows signed users', () => {
        expect(
          getIdeaPostingRules({
            project: ideationContinuous,
            authUser: mockUserData,
          })
        ).toEqual({
          show: true,
          enabled: true,
        });
      });
      it('allows admin users', () => {
        expect(
          getIdeaPostingRules({
            project: ideationContinuous,
            authUser: mockAdminData,
          })
        ).toEqual({
          show: true,
          enabled: true,
        });
      });
      it('allows moderators for this project', () => {
        expect(
          getIdeaPostingRules({
            project: ideationContinuous,
            authUser: mockThisProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: true,
        });
      });
      it('allows moderators for another project', () => {
        expect(
          getIdeaPostingRules({
            project: ideationContinuous,
            authUser: mockSomeProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: true,
        });
      });
    });

    describe('not_permitted', () => {
      it('disabled with notPermitted for signed in users', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_permitted');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockUserData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'notPermitted',
        });
      });
      it('treats moderators just as normal users', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_permitted');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockThisProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'notPermitted',
        });
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockSomeProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'notPermitted',
        });
      });
      it('disabled with maybeNotPermitted for signed out users', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_permitted');
        expect(getIdeaPostingRules({ project: accessDeniedProject })).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'maybeNotPermitted',
        });
      });
      it('allows admins', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_permitted');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockAdminData,
          })
        ).toEqual({
          show: true,
          enabled: true,
        });
      });
    });

    describe('project_inactive', () => {
      // the project mock is not fully what we expect from the back-end, it should be archived or something
      // but getIdeaPostingRules doesn't check much further than the action_descriptor.
      it('disabled with projectInactive for signed in users', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'project_inactive'
        );
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockUserData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'projectInactive',
        });
      });
      it('treats moderators (even of this project) just as normal users', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'project_inactive'
        );
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockThisProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'projectInactive',
        });
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockSomeProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'projectInactive',
        });
      });
      it('disabled with projectInactive for signed out users', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'project_inactive'
        );
        expect(getIdeaPostingRules({ project: accessDeniedProject })).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'projectInactive',
        });
      });
      it('allows admins', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'project_inactive'
        );
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockAdminData,
          })
        ).toEqual({
          show: true,
          enabled: true,
        });
      });
    });

    describe('not_verified', () => {
      // should not be returned for unsigned users
      it('disabled with notVerified for signed in users', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_verified');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockUserData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'notVerified',
        });
      });
      it('treats moderators (even of this project) just as normal users', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_verified');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockThisProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'notVerified',
        });
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockSomeProjectModeratorData,
          })
        ).toEqual({
          show: true,
          enabled: false,
          disabledReason: 'notVerified',
        });
      });
      it('allows admins', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_verified');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockAdminData,
          })
        ).toEqual({
          show: true,
          enabled: true,
        });
      });
    });

    describe('not_ideation', () => {
      // PB projets ?
      it('is not shown for users', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_ideation');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockUserData,
          }).show
        ).toBe(false);
      });
      it('is not shown for moderators', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_ideation');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockThisProjectModeratorData,
          }).show
        ).toBe(false);
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockSomeProjectModeratorData,
          }).show
        ).toBe(false);
      });
      it('is not shown for unsigned users', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_ideation');
        expect(getIdeaPostingRules({ project: accessDeniedProject }).show).toBe(
          false
        );
      });
      it('is not shown for admins', () => {
        const accessDeniedProject = getDisabledIdeationProject('not_ideation');
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockAdminData,
          }).show
        ).toBe(false);
      });
    });

    describe('posting_disabled', () => {
      it('is not shown for users', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'posting_disabled'
        );
        accessDeniedProject.attributes.posting_enabled = false;
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockUserData,
          }).show
        ).toBe(false);
      });
      it('is not shown for moderators', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'posting_disabled'
        );
        accessDeniedProject.attributes.posting_enabled = false;
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockThisProjectModeratorData,
          }).show
        ).toBe(false);
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockSomeProjectModeratorData,
          }).show
        ).toBe(false);
      });
      it('is not shown for unsigned users', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'posting_disabled'
        );
        accessDeniedProject.attributes.posting_enabled = false;
        expect(getIdeaPostingRules({ project: accessDeniedProject }).show).toBe(
          false
        );
      });
      it('is not shown for admins', () => {
        const accessDeniedProject = getDisabledIdeationProject(
          'posting_disabled'
        );
        accessDeniedProject.attributes.posting_enabled = false;
        expect(
          getIdeaPostingRules({
            project: accessDeniedProject,
            authUser: mockAdminData,
          }).show
        ).toBe(false);
      });
    });
  });

  // TODO: add some tests here
  // describe('timeline projects', () => {
  //   describe('non active phase', () => {
  //
  //   })
  // });
});
