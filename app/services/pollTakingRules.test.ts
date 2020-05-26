import { getPollTakingRules } from './pollTakingRules';

import { getMockProject } from 'services/__mocks__/projects';
import { mockUser, mockAdmin, mockProjectModerator } from 'services/__mocks__/auth';

// projects mocks continuous
const projectId = 'testProject';

// an Poll project, with posting_enabled set to true
const pollContinuous = getMockProject(projectId, 'continuous', 'poll');

const getDisabledPollProject = (disabledReason, future_enabled?) => {
  const project = getMockProject(projectId, 'continuous', 'poll');
  const taking_poll = {
    disabled_reason: disabledReason,
    enabled: false,
    future_enabled: future_enabled || null,
  };
  project.attributes.action_descriptor = { ...project.attributes.action_descriptor, taking_poll };
  return project;
};

// users Mocks
const mockUserData = mockUser.data;
const mockAdminData = mockAdmin.data;
const mockThisProjectModeratorData = mockProjectModerator(projectId).data;
const mockSomeProjectModeratorData = mockProjectModerator('rando446').data;

describe('getPollTakingRules', () => {
  describe('continuous projects', () => {
    describe('no restrictions', () => {
      it('allows unsigned users', () => {
        expect(getPollTakingRules({ project: pollContinuous, signedIn: false }))
          .toEqual({
            enabled: true,
            disabledReason: undefined
          });
      });
      it('allows signed users', () => {
        expect(getPollTakingRules({ project: pollContinuous, signedIn: true }))
          .toEqual({
            disabledReason: undefined,
            enabled: true,
          });
      });
    });

    describe('not_permitted', () => {
      it('disabled with notPermitted for signed in users', () => {
        const accessDeniedProject = getDisabledPollProject('not_permitted');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'notPermitted'
          });
      });
      it('treats moderators (even of this project) just as normal users', () => {
        const accessDeniedProject = getDisabledPollProject('not_permitted');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'notPermitted'
          });
      });
      it('disabled with maybeNotPermitted for signed out users', () => {
        const accessDeniedProject = getDisabledPollProject('not_permitted');
        expect(getPollTakingRules({ project: accessDeniedProject, signedIn: false }))
          .toEqual({
            enabled: false,
            disabledReason: 'maybeNotPermitted'
          });
      });
      it('treats admins as normal users', () => {
        const accessDeniedProject = getDisabledPollProject('not_permitted');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'notPermitted'
          });
      });
    });

    describe('project_inactive', () => {
      // the project mock is not fully what we expect from the back-end, it should be archived or something
      // but getPollTakingRules doesn't check much further than the action_descriptor.
      it('disabled with projectInactive for signed in users', () => {
        const accessDeniedProject = getDisabledPollProject('project_inactive');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'projectInactive'
          });
      });
      it('treats moderators (even of this project) just as normal users', () => {
        const accessDeniedProject = getDisabledPollProject('project_inactive');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'projectInactive'
          });
      });
      it('treats admins just as normal users', () => {
        const accessDeniedProject = getDisabledPollProject('project_inactive');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'projectInactive'
          });
      });
      it('disabled with projectInactive for signed out users', () => {
        const accessDeniedProject = getDisabledPollProject('project_inactive');
        expect(getPollTakingRules({ project: accessDeniedProject, signedIn: false }))
          .toEqual({
            enabled: false,
            disabledReason: 'projectInactive'
          });
      });
    });

    describe('not_verified', () => {
      // should not be returned for unsigned users
      it('disabled with notVerified for signed in users', () => {
        const accessDeniedProject = getDisabledPollProject('not_verified');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'notVerified'
          });
      });
      it('treats moderators (even of this project) just as normal users', () => {
        const accessDeniedProject = getDisabledPollProject('not_verified');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'notVerified'
          });
      });

      it('treats admins just as normal users', () => {
        const accessDeniedProject = getDisabledPollProject('not_verified');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'notVerified'
          });
      });
    });

    describe('not_poll', () => {
      it('is not enabled for users', () => {
        const accessDeniedProject = getDisabledPollProject('not_poll');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }).enabled).toBe(false);
      });
      it('is not enabled for moderators', () => {
        const accessDeniedProject = getDisabledPollProject('not_poll');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }).enabled).toBe(false);
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }).enabled).toBe(false);
      });
      it('is not enabled for unsigned users', () => {
        const accessDeniedProject = getDisabledPollProject('not_poll');
        expect(getPollTakingRules({ project: accessDeniedProject, signedIn: false }).enabled).toBe(false);
      });
      it('is not enabled for admins', () => {
        const accessDeniedProject = getDisabledPollProject('not_poll');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }).enabled).toBe(false);
      });
    });

    describe('already_responded', () => {
      it('is not enabled for users', () => {
        const accessDeniedProject = getDisabledPollProject('already_responded');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'alreadyResponded'
          });
      });
      it('is not enabled for moderators', () => {
        const accessDeniedProject = getDisabledPollProject('already_responded');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'alreadyResponded'
          });
      });
      it('is not enabled for unsigned users', () => {
        const accessDeniedProject = getDisabledPollProject('already_responded');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'alreadyResponded'
          });
      });
      it('is not enabled for admins', () => {
        const accessDeniedProject = getDisabledPollProject('already_responded');
        expect(getPollTakingRules({
          project: accessDeniedProject, signedIn: true
        }))
          .toEqual({
            enabled: false,
            disabledReason: 'alreadyResponded'
          });
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
