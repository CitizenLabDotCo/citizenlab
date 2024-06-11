# frozen_string_literal: true

require 'rails_helper'

describe Permissions::UserRequirementsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '#requirements' do
    before do
      create(:custom_field_birthyear, required: true)
      create(:custom_field_gender, required: false)
      create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_required_field')
      create(:custom_field_number, resource_type: 'User', required: false, key: 'extra_optional_field')
    end

    let(:user) do
      create(
        :user,
        first_name: 'Jane',
        last_name: 'Jacobs',
        email: 'jane@jacobs.com',
        custom_field_values: {
          'gender' => 'female',
          'birthyear' => 1975,
          'extra_required_field' => false,
          'extra_optional_field' => 29
        },
        password: 'supersecret',
        email_confirmed_at: Time.now
      )
    end

    context 'when onboarding is possible (there are topics and areas assigned to projects)' do
      before { create(:topic, include_in_onboarding: true) }

      context 'when permitted_by is set to everyone' do
        let(:permission) { create(:permission, permitted_by: 'everyone', global_custom_fields: false) }

        it 'permits a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'dont_ask',
                email: 'dont_ask'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'dont_ask',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'dont_ask',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end

      context 'when permitted_by is set to everyone_confirmed_email' do
        let(:permission) { create(:permission, permitted_by: 'everyone_confirmed_email', global_custom_fields: false) }

        before do
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_custom_field, permission: permission, custom_field: field, required: false)
        end

        it 'does not permit a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'dont_ask',
                email: 'require'
              },
              custom_fields: {
                'birthyear' => 'ask'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'ask'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a light confirmed resident' do
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'ask'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a fully registered unconfirmed resident' do # https://citizenlabco.slack.com/archives/C04FX2ATE5B/p1677170928400679
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end

      context 'when permitted_by is set to users' do
        let(:permission) { create(:permission, permitted_by: 'users', global_custom_fields: true) }

        before do
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_custom_field, permission: permission, custom_field: field, required: false)
        end

        it 'does not permit a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'require',
                email: 'require'
              },
              custom_fields: {
                'birthyear' => 'require',
                'gender' => 'ask',
                'extra_required_field' => 'require',
                'extra_optional_field' => 'ask'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a light confirmed resident' do
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'require',
                'gender' => 'ask',
                'extra_required_field' => 'require',
                'extra_optional_field' => 'ask'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a fully registered unconfirmed resident' do
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not ask onboarding for a fully registered confirmed resident when onboarding is not possible' do
          app_configuration = AppConfiguration.instance
          app_configuration.settings['core']['onboarding'] = false
          app_configuration.save!

          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end

      context 'when permitted_by is set to groups' do
        let(:group) { create(:group) }
        let(:permission) { create(:permission, permitted_by: 'groups', groups: [group], global_custom_fields: false) }

        context 'user is not in the group' do
          before do
            field = CustomField.find_by code: 'birthyear'
            create(:permissions_custom_field, permission: permission, custom_field: field, required: true)
          end

          it 'does not permit a visitor' do
            expect(service.requirements(permission, nil)).to eq({
              permitted: false,
              requirements: {
                built_in: {
                  first_name: 'require',
                  last_name: 'require',
                  email: 'require'
                },
                custom_fields: {
                  'birthyear' => 'require'
                },
                onboarding: { topics_and_areas: 'ask' },
                special: {
                  password: 'require',
                  confirmation: 'require',
                  verification: 'dont_ask',
                  group_membership: 'require'
                }
              }
            })
          end

          it 'does not permit a light unconfirmed resident' do
            user.reset_confirmation_and_counts
            user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: { 'birthyear' => 1968 })
            expect(service.requirements(permission, user)).to eq({
              permitted: false,
              requirements: {
                built_in: {
                  first_name: 'require',
                  last_name: 'satisfied',
                  email: 'satisfied'
                },
                custom_fields: {
                  'birthyear' => 'satisfied'
                },
                onboarding: { topics_and_areas: 'ask' },
                special: {
                  password: 'require',
                  confirmation: 'require',
                  verification: 'dont_ask',
                  group_membership: 'require'
                }
              }
            })
          end

          it 'does not permit a fully registered confirmed resident' do
            expect(service.requirements(permission, user)).to eq({
              permitted: false,
              requirements: {
                built_in: {
                  first_name: 'satisfied',
                  last_name: 'satisfied',
                  email: 'satisfied'
                },
                custom_fields: {
                  'birthyear' => 'satisfied'
                },
                onboarding: { topics_and_areas: 'ask' },
                special: {
                  password: 'satisfied',
                  confirmation: 'satisfied',
                  verification: 'dont_ask',
                  group_membership: 'require'
                }
              }
            })
          end

          it 'does not permit an unconfirmed admin' do
            user.add_role 'admin'
            user.reset_confirmation_and_counts
            expect(service.requirements(permission, user)).to eq({
              permitted: false,
              requirements: {
                built_in: {
                  first_name: 'satisfied',
                  last_name: 'satisfied',
                  email: 'satisfied'
                },
                custom_fields: {
                  'birthyear' => 'satisfied'
                },
                onboarding: { topics_and_areas: 'ask' },
                special: {
                  password: 'satisfied',
                  confirmation: 'require',
                  verification: 'dont_ask',
                  group_membership: 'require'
                }
              }
            })
          end

          it 'does not permit a confirmed admin' do
            user.add_role 'admin'
            expect(service.requirements(permission, user)).to eq({
              permitted: false,
              requirements: {
                built_in: {
                  first_name: 'satisfied',
                  last_name: 'satisfied',
                  email: 'satisfied'
                },
                custom_fields: {
                  'birthyear' => 'satisfied'
                },
                onboarding: { topics_and_areas: 'ask' },
                special: {
                  password: 'satisfied',
                  confirmation: 'satisfied',
                  verification: 'dont_ask',
                  group_membership: 'require'
                }
              }
            })
          end
        end

        context 'user is in the group' do
          before { create(:membership, user: user, group: group) }

          it 'permits a fully registered confirmed resident who is in the group' do
            expect(service.requirements(permission, user)).to eq({
              permitted: true,
              requirements: {
                built_in: {
                  first_name: 'satisfied',
                  last_name: 'satisfied',
                  email: 'satisfied'
                },
                custom_fields: {},
                onboarding: { topics_and_areas: 'ask' },
                special: {
                  password: 'satisfied',
                  confirmation: 'satisfied',
                  verification: 'dont_ask',
                  group_membership: 'satisfied'
                }
              }
            })
          end
        end
      end

      context 'when permitted_by is set to admins_moderators' do
        let(:permission) { create(:permission, permitted_by: 'admins_moderators', global_custom_fields: false) }

        before { SettingsService.new.deactivate_feature! 'user_confirmation' }

        it 'does not permit a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'require',
                email: 'require'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'dont_ask',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered unconfirmed resident' do
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end
    end

    context 'when onboarding is not possible (there are no topics or areas assigned to projects)' do
      context 'when permitted_by is set to users' do
        let(:permission) { create(:permission, permitted_by: 'users', global_custom_fields: true) }

        before do
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_custom_field, permission: permission, custom_field: field, required: false)
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end
    end
  end

  describe '#requirements_fields' do
    let(:custom_fields) { [true, false, false].map { |required| create(:custom_field, required: required) } }
    let(:permission) do
      create(:permission, global_custom_fields: global_custom_fields).tap do |permission|
        custom_fields.take(2).each do |field|
          create(:permissions_custom_field, permission: permission, custom_field: field, required: !field.required)
        end
        permission.reload
      end
    end
    let(:requirements_fields) { service.requirements_fields permission }

    context 'when global_custom_fields is true' do
      let(:global_custom_fields) { true }

      it 'returns the global fields' do
        expect(requirements_fields.map(&:id)).to eq custom_fields.map(&:id)
        expect(requirements_fields.map(&:required)).to eq [true, false, false]
      end
    end

    context 'when global_custom_fields is false' do
      let(:global_custom_fields) { false }

      it 'returns the global fields' do
        expect(requirements_fields.map(&:id)).to eq custom_fields.take(2).map(&:id)
        expect(requirements_fields.map(&:required)).to eq [false, true]
      end
    end
  end
end
