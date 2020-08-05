import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { IDestination, initialPreferences, adminIntegrations } from './';
import ConsentManagerBuilderHandler from './ConsentManagerBuilderHandler';

// mock depencies
jest.mock('./Container', () => 'Container');

// mimics the destination/newDestinations objects from sentry
const nonAdminDestinations = [
  {
    name: 'Google Tag Manager',
    description:
      'Google Tag Manager is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
    category: 'Tag Managers', // as per defined in categories file, this falls under advertising
    website: 'http://google.com/tagManager',
    id: 'Google Tag Manager',
  },
  {
    name: 'MarketingTool',
    description:
      'MarketingTool is the most popular marketing tool for the web. It’s free and provides a wide range of features. It’s especially good at measuring traffic sources and ad campaigns.',
    category: 'Analytics',
    website: 'http://random.com/marketing',
    id: 'MarketingTool',
  },
  {
    name: 'AdvertisingTool',
    description: 'Advertising BS',
    category: 'Advertising',
    website: 'http://random.com/advertising',
    id: 'AdvertisingTool',
  },
  {
    name: 'FunctionalTool',
    description: 'Actually might be handy',
    category: 'Security & Fraud',
    website: 'http://random.com/securitycookie',
    id: 'FunctionalTool',
  },
];

const adminDestinations = [
  {
    name: 'Intercom',
    description: 'Only for admins',
    category: 'Helpdesk',
    website: 'intercomUrl',
    id: 'Intercom',
  },
  {
    name: 'SatisMeter',
    description: 'SatisMeter',
    category: 'Customer Success',
    website: 'http://random.com/satifactoryCookies',
    id: 'SatisMeter',
  },
];

const destinations = [...nonAdminDestinations, ...adminDestinations];

let setPreferences = jest.fn();
let resetPreferences = jest.fn();
let saveConsent = jest.fn();

// mimics props for a first time user, takes in the blacklist
const firstTimeUser = (tenantBlacklistedDestinationIds, isPriviledged) => ({
  setPreferences,
  resetPreferences,
  saveConsent,
  destinations,
  tenantBlacklistedDestinationIds,
  roleBlacklistedDestinationIds: isPriviledged ? [] : adminIntegrations,
  newDestinations: destinations,
  preferences: initialPreferences,
});

// mimics props for a returning user ith no new destinations
const returningUser = (
  tenantBlacklistedDestinationIds,
  isPriviledged,
  oldTenantDestinations,
  wasPrivileged
) => ({
  setPreferences,
  resetPreferences,
  saveConsent,
  destinations,
  tenantBlacklistedDestinationIds,
  roleBlacklistedDestinationIds: isPriviledged ? [] : adminIntegrations,
  newDestinations: [],
  preferences: {
    advertising: false,
    analytics: true,
    functional: true,
    tenantBlacklisted: oldTenantDestinations,
    roleBlacklisted: wasPrivileged ? [] : adminIntegrations,
  },
});

// mimics props for a returning user when there's new destinations added in segment
const newDestinations = [
  {
    name: 'NewTool',
    description:
      'NewTool is the new kid in town, lets you record everything the user does and watch in in real time !',
    category: 'Heatmaps & Recordings', // as per defined in categories file, this falls under marketing
    website: 'http://random.com/NewTool',
    id: 'NewTool',
  },
];
const returningUserNewDestinations = (
  tenantBlacklistedDestinationIds,
  isPriviledged,
  oldTenantDestinations,
  wasPrivileged
) => {
  return {
    setPreferences,
    resetPreferences,
    saveConsent,
    destinations,
    newDestinations,
    tenantBlacklistedDestinationIds,
    roleBlacklistedDestinationIds: isPriviledged ? [] : adminIntegrations,
    preferences: {
      advertising: false,
      analytics: true,
      functional: true,
      tenantBlacklisted: oldTenantDestinations,
      roleBlacklisted: wasPrivileged ? [] : adminIntegrations,
    },
  };
};

const emptyBlacklist = [];
const blacklist = ['Google Tag Manager', 'MarketingTool'];
const everyNonAdminDestinationIds = nonAdminDestinations.map((item) => item.id);
const destinationIds = destinations.map((item) => item.id);

describe('<ConsentManagerBuilderHandler />', () => {
  beforeEach(() => {
    setPreferences = jest.fn();
    resetPreferences = jest.fn();
    saveConsent = jest.fn();
  });

  describe('passes down props and handlers from SCM', () => {
    it('passes down props and handlers from SCM', () => {
      const wrapper = shallow(
        <ConsentManagerBuilderHandler {...firstTimeUser([], false)} />
      );

      const expectedProps = {
        setPreferences,
        resetPreferences,
        saveConsent,
        preferences: initialPreferences,
      };
      const actualProps = wrapper.find('Container').props();
      Object.keys(expectedProps).forEach((key) =>
        expect(actualProps[key] === expectedProps[key])
      );
    });
  });

  describe('classifies detinations into categories: ', () => {
    describe('Normal User', () => {
      it('...without a blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler
            {...firstTimeUser(emptyBlacklist, false)}
          />
        );
        const { categorizedDestinations } = wrapper.find('Container').props();

        expect(
          new Set(
            categorizedDestinations.functional.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['FunctionalTool']));

        expect(
          new Set(
            categorizedDestinations.advertising.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['Google Tag Manager', 'AdvertisingTool']));

        expect(
          new Set(
            categorizedDestinations.analytics.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['MarketingTool']));
        //
        // expect(categorizedDestinations.tenantBlacklisted).toEqual(emptyBlacklist);
        // expect(categorizedDestinations.roleBlacklisted).toEqual(adminIntegrations);
      });
      it('...with a blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler {...firstTimeUser(blacklist, false)} />
        );
        const { categorizedDestinations } = wrapper.find('Container').props();

        expect(
          new Set(
            categorizedDestinations.functional.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['FunctionalTool']));
        expect(
          new Set(
            categorizedDestinations.advertising.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['AdvertisingTool']));
        expect(
          new Set(
            categorizedDestinations.analytics.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set([]));
        //
        // expect(categorizedDestinations.tenantBlacklisted).toEqual(blacklist);
        // expect(categorizedDestinations.roleBlacklisted).toEqual(adminIntegrations);
      });
    });
    describe('Admin User', () => {
      it('...without a blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler
            {...firstTimeUser(emptyBlacklist, true)}
          />
        );
        const { categorizedDestinations } = wrapper.find('Container').props();

        expect(
          new Set(
            categorizedDestinations.functional.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['FunctionalTool', 'SatisMeter', 'Intercom']));
        expect(
          new Set(
            categorizedDestinations.advertising.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['Google Tag Manager', 'AdvertisingTool']));
        expect(
          new Set(
            categorizedDestinations.analytics.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['MarketingTool']));
      });

      it('...with a blacklist', () => {
        const wrapper = shallow(
          <ConsentManagerBuilderHandler {...firstTimeUser(blacklist, true)} />
        );
        const { categorizedDestinations } = wrapper.find('Container').props();

        expect(
          new Set(
            categorizedDestinations.functional.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['FunctionalTool', 'SatisMeter', 'Intercom']));
        expect(
          new Set(
            categorizedDestinations.advertising.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set(['AdvertisingTool']));
        expect(
          new Set(
            categorizedDestinations.analytics.map(
              (destination) => destination.id
            )
          )
        ).toEqual(new Set([]));
      });
    });
  });
  describe('determines whether consent and auto-save are required', () => {
    describe('first time user', () => {
      describe('normal user', () => {
        it("no blacklist: expects consent, does't save", () => {
          const wrapper = shallow(
            <ConsentManagerBuilderHandler
              {...firstTimeUser(emptyBlacklist, false)}
            />
          );
          const { isConsentRequired } = wrapper.find('Container').props();
          expect(isConsentRequired).toEqual(true);
          expect(saveConsent).toHaveBeenCalledTimes(0);
        });
        it("with a blacklist: expects consent, doesn't save", () => {
          const wrapper = shallow(
            <ConsentManagerBuilderHandler
              {...firstTimeUser(blacklist, false)}
            />
          );
          const { isConsentRequired } = wrapper.find('Container').props();
          expect(isConsentRequired).toEqual(true);
          expect(saveConsent).toHaveBeenCalledTimes(0);
        });
        it("all non admin destinations on the blacklist: doesn't expect consent, saves", () => {
          const wrapper = shallow(
            <ConsentManagerBuilderHandler
              {...firstTimeUser(everyNonAdminDestinationIds, false)}
            />
          );
          const { isConsentRequired } = wrapper.find('Container').props();
          expect(isConsentRequired).toEqual(false);
          expect(saveConsent).toHaveBeenCalledTimes(1);
        });
      });
      describe('admin user', () => {
        it("no blacklist: expects consent, does't save", () => {
          const wrapper = shallow(
            <ConsentManagerBuilderHandler
              {...firstTimeUser(emptyBlacklist, true)}
            />
          );
          const { isConsentRequired } = wrapper.find('Container').props();
          expect(isConsentRequired).toEqual(true);
          expect(saveConsent).toHaveBeenCalledTimes(0);
        });
        it("with a blacklist: expects consent, doesn't save", () => {
          const wrapper = shallow(
            <ConsentManagerBuilderHandler {...firstTimeUser(blacklist, true)} />
          );
          const { isConsentRequired } = wrapper.find('Container').props();
          expect(isConsentRequired).toEqual(true);
          expect(saveConsent).toHaveBeenCalledTimes(0);
        });
        it('all non admin destinations on the blacklist: expects consent', () => {
          const wrapper = shallow(
            <ConsentManagerBuilderHandler
              {...firstTimeUser(everyNonAdminDestinationIds, true)}
            />
          );
          const { isConsentRequired } = wrapper.find('Container').props();
          expect(isConsentRequired).toEqual(true);
          expect(saveConsent).toHaveBeenCalledTimes(0);
        });
        it('all destinations on the blacklist: expects consent', () => {
          const wrapper = shallow(
            <ConsentManagerBuilderHandler
              {...firstTimeUser(destinationIds, true)}
            />
          );
          const { isConsentRequired } = wrapper.find('Container').props();
          expect(isConsentRequired).toEqual(false);
          expect(saveConsent).toHaveBeenCalledTimes(1);
        });
      });
    });
    describe('returing user', () => {
      describe('normal user', () => {
        describe('without new destinations', () => {
          it("no blacklist: doesn't expect consent nor saves", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(emptyBlacklist, false, emptyBlacklist, false)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          describe('unchanged tenant blacklist', () => {
            it("doesn't expect consent nor saves", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUser(blacklist, false, blacklist, false)}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("all but admin destinations: doesn't expect consent nor saves", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUser(
                    everyNonAdminDestinationIds,
                    false,
                    everyNonAdminDestinationIds,
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("all: doesn't expect consent nor saves", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUser(
                    destinationIds,
                    false,
                    destinationIds,
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
          });
          describe('changed tenant blacklist', () => {
            describe('additions', () => {
              it("from non to some: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(blacklist, false, emptyBlacklist, false)}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
              it("from none to all but admin destinations blacklist: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      everyNonAdminDestinationIds,
                      false,
                      emptyBlacklist,
                      false
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
              it("from some to all but admin destinations blacklist: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      everyNonAdminDestinationIds,
                      false,
                      blacklist,
                      false
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
              it("from non to all: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      destinationIds,
                      false,
                      emptyBlacklist,
                      false
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
            });
            describe('removals', () => {
              it("from some to none: expects consent, doesn't save", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(emptyBlacklist, false, blacklist, false)}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(true);
                expect(saveConsent).toHaveBeenCalledTimes(0);
              });
              it("from all to none: expects consent, doesn't save", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      emptyBlacklist,
                      false,
                      destinationIds,
                      false
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(true);
                expect(saveConsent).toHaveBeenCalledTimes(0);
              });
              it("from all to all but admin destinations: expects consent, doesn't save", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      everyNonAdminDestinationIds,
                      false,
                      blacklist,
                      false
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
            });
          });
        });
        describe('with new destinations', () => {
          it("no blacklist: expects consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUserNewDestinations(
                  emptyBlacklist,
                  false,
                  emptyBlacklist,
                  false
                )}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(true);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          describe('unchanged tenant blacklist', () => {
            it("expects consent, doesn't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    blacklist,
                    false,
                    blacklist,
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("all but admin destinations: expects consent, doesn't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    everyNonAdminDestinationIds,
                    false,
                    everyNonAdminDestinationIds,
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("new destination is on the black list: doesn't expect consent, doesn't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    [...destinationIds, 'NewTool'],
                    false,
                    [...destinationIds, 'NewTool'],
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
          });
          describe('changed tenant blacklist', () => {
            it("from non to some: expects consent, does't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    blacklist,
                    false,
                    emptyBlacklist,
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it('new destination was added to the blacklist: does\t expect consent, saves', () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    [...blacklist, 'NewTool'],
                    false,
                    blacklist,
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(1);
            });
            it("new destination was removed from the blacklist: expects consent, does't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    blacklist,
                    false,
                    [...blacklist, 'NewTool'],
                    false
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
          });
        });
      });
      describe('admin user (same as normal)', () => {
        describe('without new destinations', () => {
          it("no blacklist: doesn't expect consent nor saves", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(emptyBlacklist, true, emptyBlacklist, true)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          describe('unchanged tenant blacklist', () => {
            it("doesn't expect consent nor saves", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUser(blacklist, true, blacklist, true)}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("all but admin destinations: doesn't expect consent nor saves", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUser(
                    everyNonAdminDestinationIds,
                    true,
                    everyNonAdminDestinationIds,
                    true
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("all: doesn't expect consent nor saves", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUser(destinationIds, true, destinationIds, true)}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
          });
          describe('changed tenant blacklist', () => {
            describe('additions', () => {
              it("from non to some: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(blacklist, true, emptyBlacklist, true)}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
              it("from none to all but admin destinations blacklist: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      everyNonAdminDestinationIds,
                      true,
                      emptyBlacklist,
                      true
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
              it("from some to all but admin destinations blacklist: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      everyNonAdminDestinationIds,
                      true,
                      blacklist,
                      true
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
              it("from non to all: doesn't expect consent, saves", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      destinationIds,
                      true,
                      emptyBlacklist,
                      true
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
            });
            describe('removals', () => {
              it("from some to none: expects consent, doesn't save", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(emptyBlacklist, true, blacklist, true)}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(true);
                expect(saveConsent).toHaveBeenCalledTimes(0);
              });
              it("from all to none: expects consent, doesn't save", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      emptyBlacklist,
                      true,
                      destinationIds,
                      true
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(true);
                expect(saveConsent).toHaveBeenCalledTimes(0);
              });
              it("from all to all but admin destinations: expects consent, doesn't save", () => {
                const wrapper = shallow(
                  <ConsentManagerBuilderHandler
                    {...returningUser(
                      everyNonAdminDestinationIds,
                      true,
                      blacklist,
                      true
                    )}
                  />
                );
                const { isConsentRequired } = wrapper.find('Container').props();
                expect(isConsentRequired).toEqual(false);
                expect(saveConsent).toHaveBeenCalledTimes(1);
              });
            });
          });
        });
        describe('with new destinations', () => {
          it("no blacklist: expects consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUserNewDestinations(
                  emptyBlacklist,
                  true,
                  emptyBlacklist,
                  true
                )}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(true);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          describe('unchanged tenant blacklist', () => {
            it("expects consent, doesn't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    blacklist,
                    true,
                    blacklist,
                    true
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("all but admin destinations: expects consent, doesn't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    everyNonAdminDestinationIds,
                    true,
                    everyNonAdminDestinationIds,
                    true
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("new destination is on the black list: doesn't expect consent, doesn't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    [...destinationIds, 'NewTool'],
                    true,
                    [...destinationIds, 'NewTool'],
                    true
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
          });
          describe('changed tenant blacklist', () => {
            it("from non to some: expects consent, does't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    blacklist,
                    true,
                    emptyBlacklist,
                    true
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
            it("new destination was added to the blacklist: doesn't expect consent, saves", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    [...blacklist, 'NewTool'],
                    true,
                    blacklist,
                    true
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(false);
              expect(saveConsent).toHaveBeenCalledTimes(1);
            });
            it("new destination was removed from the blacklist: expects consent, doesn't save", () => {
              const wrapper = shallow(
                <ConsentManagerBuilderHandler
                  {...returningUserNewDestinations(
                    blacklist,
                    true,
                    [...blacklist, 'NewTool'],
                    true
                  )}
                />
              );
              const { isConsentRequired } = wrapper.find('Container').props();
              expect(isConsentRequired).toEqual(true);
              expect(saveConsent).toHaveBeenCalledTimes(0);
            });
          });
        });
      });
      describe('changing role', () => {
        describe('no blacklist', () => {
          it("from normal to admin: asks consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(emptyBlacklist, true, emptyBlacklist, false)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(true);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          it("from admin to normal: doesn't ask for consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(emptyBlacklist, false, emptyBlacklist, true)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
        });
        describe('stable blacklist', () => {
          it("from normal to admin: asks consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(blacklist, true, blacklist, false)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(true);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          it("from admin to normal: doesn't ask for consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(blacklist, false, blacklist, true)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
        });
        describe('all blacklisted but admin destinations', () => {
          it("from normal to admin: asks consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(
                  everyNonAdminDestinationIds,
                  true,
                  everyNonAdminDestinationIds,
                  false
                )}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(true);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          it("from admin to normal: doesn't ask for consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(
                  everyNonAdminDestinationIds,
                  false,
                  everyNonAdminDestinationIds,
                  true
                )}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
        });
        describe('all blacklisted', () => {
          it("from normal to admin: doesn't ask for consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(destinationIds, true, destinationIds, false)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          it("from admin to normal: doesn't ask for consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                {...returningUser(destinationIds, false, destinationIds, true)}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
        });
        describe('migrating from previous cookie system', () => {
          it("as an admin: doesn't ask for consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                setPreferences={setPreferences}
                resetPreferences={resetPreferences}
                saveConsent={saveConsent}
                destinations={destinations}
                tenantBlacklistedDestinationIds={[]}
                roleBlacklistedDestinationIds={[]}
                newDestinations={[]}
                preferences={{
                  advertising: false,
                  analytics: true,
                  functional: true,
                  tenantBlacklisted: [],
                  roleBlacklisted: undefined,
                }}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
          it("unprivileged: doesn't ask for consent, doesn't save", () => {
            const wrapper = shallow(
              <ConsentManagerBuilderHandler
                setPreferences={setPreferences}
                resetPreferences={resetPreferences}
                saveConsent={saveConsent}
                destinations={destinations}
                tenantBlacklistedDestinationIds={[]}
                roleBlacklistedDestinationIds={adminIntegrations}
                newDestinations={[]}
                preferences={{
                  advertising: false,
                  analytics: true,
                  functional: true,
                  tenantBlacklisted: adminIntegrations,
                  roleBlacklisted: undefined,
                }}
              />
            );
            const { isConsentRequired } = wrapper.find('Container').props();
            expect(isConsentRequired).toEqual(false);
            expect(saveConsent).toHaveBeenCalledTimes(0);
          });
        });
      });
    });
  });
});
