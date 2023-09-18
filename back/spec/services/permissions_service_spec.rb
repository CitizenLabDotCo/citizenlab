# frozen_string_literal: true

require 'rails_helper'

describe PermissionsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '#denied_reason_for_resource' do
    let(:action) { 'posting_initiative' }
    let(:permission) { Permission.find_by(permission_scope: nil, action: action) }
    let(:user) { create(:user) }

    before { service.update_global_permissions }

    it 'returns nil when action is allowed' do
      groups = create_list(:group, 2)
      groups.first.add_member(user).save!
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      expect(service.denied_reason_for_resource(user, action)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_resource(nil, action)).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when user is not in authorized groups' do
      permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2).map(&:id))
      expect(service.denied_reason_for_resource(user, action)).to eq 'not_in_group'
    end
  end

  describe '#denied_reason_for_permission' do
    before do
      create(:custom_field_birthyear, required: true)
      create(:custom_field_gender, required: false)
      create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_required_field')
      create(:custom_field_number, resource_type: 'User', required: false, key: 'extra_optional_field')
    end

    let(:user) do
      create(
        :user,
        first_name: 'Jerry',
        last_name: 'Jones',
        email: 'jerry@jones.com',
        custom_field_values: {
          'gender' => 'male',
          'birthyear' => 1982,
          'extra_required_field' => false,
          'extra_optional_field' => 29
        },
        registration_completed_at: Time.now,
        password: 'supersecret',
        email_confirmed_at: Time.now
      )
    end

    let(:permission) { create(:permission, permitted_by: permitted_by) }
    let(:denied_reason) { service.denied_reason_for_permission permission, user }

    context 'when permitted by everyone' do
      let(:permitted_by) { 'everyone' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to be_nil }
      end
    end

    context 'when permitted by light users' do
      let(:permitted_by) { 'everyone_confirmed_email' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end

    context 'when permitted by full residents' do
      let(:permitted_by) { 'users' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed inactive resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered sso user' do
        before do
          facebook_identity = create(:facebook_identity)
          user.identities << facebook_identity
          user.update!(password_digest: nil)
          user.save!
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end

    context 'when permitted by groups' do
      let(:groups) { create_list(:group, 2) }
      let(:permission) { create(:permission, permitted_by: 'groups', groups: groups) }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light unconfirmed resident who is group member' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, manual_groups: [groups.last])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed resident who is not a group member' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'not_in_group' }
      end

      context 'when fully registered resident who is not a group member' do
        it { expect(denied_reason).to eq 'not_in_group' }
      end

      context 'when admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when permitted by is changed from groups to users' do
        before { permission.update!(permitted_by: 'users') }

        it { expect(denied_reason).to be_nil }
      end
    end

    context 'when permitted by moderators' do
      let(:permitted_by) { 'admins_moderators' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'not_permitted' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end
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
