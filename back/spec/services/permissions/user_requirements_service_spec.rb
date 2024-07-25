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

        let(:expected_requirements) do
          {
            authentication: {
              permitted_by: 'everyone',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: false,
            group_membership: false
          }
        end

        it 'permits a visitor' do
          requirements = service.requirements(permission, nil)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq expected_requirements
        end

        it 'permits a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          requirements = service.requirements(permission, nil)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq expected_requirements
        end

        it 'permits a fully registered confirmed resident' do
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq expected_requirements
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq expected_requirements
        end
      end

      context 'when permitted_by is set to everyone_confirmed_email' do
        let(:permission) { create(:permission, permitted_by: 'everyone_confirmed_email', global_custom_fields: false) }

        before do
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_field, permission: permission, custom_field: field, required: false)
        end

        it 'does not permit a visitor' do
          requirements = service.requirements(permission, nil)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'everyone_confirmed_email',
              missing_user_attributes: %i[email confirmation]
            },
            verification: false,
            custom_fields: { 'birthyear' => 'optional' },
            onboarding: false,
            group_membership: false
          })
        end

        it 'does not permit a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'everyone_confirmed_email',
              missing_user_attributes: [:confirmation]
            },
            verification: false,
            custom_fields: { 'birthyear' => 'optional' },
            onboarding: false,
            group_membership: false
          })
        end

        it 'permits a light confirmed resident' do
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'everyone_confirmed_email',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: { 'birthyear' => 'optional' },
            onboarding: false,
            group_membership: false
          })
        end

        it 'does not permit a fully registered unconfirmed resident' do # https://citizenlabco.slack.com/archives/C04FX2ATE5B/p1677170928400679
          user.reset_confirmation_and_counts
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'everyone_confirmed_email',
              missing_user_attributes: [:confirmation]
            },
            verification: false,
            custom_fields: {},
            onboarding: false,
            group_membership: false
          })
        end

        it 'permits a fully registered confirmed resident' do
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'everyone_confirmed_email',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: false,
            group_membership: false
          })
        end

        it 'does not permit an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'everyone_confirmed_email',
              missing_user_attributes: [:confirmation]
            },
            verification: false,
            custom_fields: {},
            onboarding: false,
            group_membership: false
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'everyone_confirmed_email',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: false,
            group_membership: false
          })
        end
      end

      context 'when permitted_by is set to users' do
        let(:permission) { create(:permission, permitted_by: 'users', global_custom_fields: true) }

        before do
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_field, permission: permission, custom_field: field, required: false)
        end

        it 'does not permit a visitor' do
          requirements = service.requirements(permission, nil)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: %i[first_name last_name email confirmation password]
            },
            verification: false,
            custom_fields: {
              'birthyear' => 'required',
              'gender' => 'optional',
              'extra_required_field' => 'required',
              'extra_optional_field' => 'optional'
            },
            onboarding: true,
            group_membership: false
          })
        end

        it 'does not permit a light confirmed resident' do
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: %i[first_name password]
            },
            verification: false,
            custom_fields: {
              'birthyear' => 'required',
              'gender' => 'optional',
              'extra_required_field' => 'required',
              'extra_optional_field' => 'optional'
            },
            onboarding: true,
            group_membership: false
          })
        end

        it 'does not permit a fully registered unconfirmed resident' do
          user.reset_confirmation_and_counts
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: [:confirmation]
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        it 'permits a fully registered confirmed resident' do
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        it 'does not ask onboarding for a fully registered confirmed resident when onboarding is not possible' do
          app_configuration = AppConfiguration.instance
          app_configuration.settings['core']['onboarding'] = false
          app_configuration.save!

          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: false,
            group_membership: false
          })
        end

        it 'does not permit an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: [:confirmation]
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        context 'there are groups on the permission' do
          let(:group) { create(:group) }

          before { permission.groups << group }

          it 'does not permit a user if they are not in the group' do
            requirements = service.requirements(permission, user)
            expect(service.permitted?(requirements)).to be false
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'users',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: true
            })
          end

          it 'permits a user if they are in the group' do
            create(:membership, user: user, group: group)
            requirements = service.requirements(permission, user)
            expect(service.permitted?(requirements)).to be true
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'users',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: false
            })
          end
        end
      end

      context 'when permitted_by is set to groups' do
        let(:group) { create(:group) }
        let(:permission) do
          permission = create(:permission, permitted_by: 'groups', groups: [group])
          permission.update!(global_custom_fields: false) # As global_custom_fields is fixed to true on creation for groups
          permission
        end

        context 'user is not in the group' do
          before do
            permission
            field = CustomField.find_by code: 'birthyear'
            create(:permissions_field, permission: permission, custom_field: field, required: true)
          end

          it 'does not permit a visitor' do
            requirements = service.requirements(permission, nil)
            expect(service.permitted?(requirements)).to be false
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'groups',
                missing_user_attributes: %i[first_name last_name email confirmation password]
              },
              verification: false,
              custom_fields: {
                'birthyear' => 'required'
              },
              onboarding: true,
              group_membership: true
            })
          end

          it 'does not permit a light unconfirmed resident' do
            user.reset_confirmation_and_counts
            user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: { 'birthyear' => 1968 })
            requirements = service.requirements(permission, user)
            expect(service.permitted?(requirements)).to be false
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'groups',
                missing_user_attributes: %i[first_name confirmation password]
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: true
            })
          end

          it 'does not permit a fully registered confirmed resident' do
            requirements = service.requirements(permission, user)
            expect(service.permitted?(requirements)).to be false
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'groups',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: true
            })
          end

          it 'does not permit an unconfirmed admin' do
            user.add_role 'admin'
            user.reset_confirmation_and_counts
            requirements = service.requirements(permission, user)
            expect(service.permitted?(requirements)).to be false
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'groups',
                missing_user_attributes: [:confirmation]
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: true
            })
          end

          it 'does not permit a confirmed admin' do
            # TODO: JS - Should this be true?
            user.add_role 'admin'
            requirements = service.requirements(permission, user)
            expect(service.permitted?(requirements)).to be false
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'groups',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: true
            })
          end
        end

        context 'user is in the group' do
          before { create(:membership, user: user, group: group) }

          it 'permits a fully registered confirmed resident who is in the group' do
            requirements = service.requirements(permission, user)
            expect(service.permitted?(requirements)).to be true
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'groups',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: false
            })
          end
        end
      end

      context 'when permitted_by is set to admins_moderators and user confirmation feature is off' do
        let(:permission) { create(:permission, permitted_by: 'admins_moderators', global_custom_fields: false) }

        before { SettingsService.new.deactivate_feature! 'user_confirmation' }

        it 'does not permit a visitor' do
          requirements = service.requirements(permission, nil)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'admins_moderators',
              missing_user_attributes: %i[first_name last_name email confirmation password]
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        it 'does not permit a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'admins_moderators',
              missing_user_attributes: %i[first_name password]
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        # TODO: JS - should this be true?
        it 'permits a fully registered unconfirmed resident' do
          user.reset_confirmation_and_counts
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'admins_moderators',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        it 'permits an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'admins_moderators',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'admins_moderators',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: true,
            group_membership: false
          })
        end
      end
    end

    context 'when onboarding is not possible (there are no topics or areas assigned to projects)' do
      context 'when permitted_by is set to users' do
        let(:permission) { create(:permission, permitted_by: 'users', global_custom_fields: true) }

        before do
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_field, permission: permission, custom_field: field, required: false)
        end

        it 'permits a fully registered confirmed resident' do
          requirements = service.requirements(permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements).to eq({
            authentication: {
              permitted_by: 'users',
              missing_user_attributes: []
            },
            verification: false,
            custom_fields: {},
            onboarding: false,
            group_membership: false
          })
        end
      end
    end
  end

  describe '#requirements_fields' do
    let(:custom_fields) { [true, false, false].map { |required| create(:custom_field, required: required) } }
    let(:permission) do
      create(:permission).tap do |permission|
        custom_fields.take(2).each do |field|
          create(:permissions_field, permission: permission, custom_field: field, required: !field.required)
        end
        permission.reload
      end
    end
    let(:requirements_custom_fields) { service.requirements_custom_fields permission }

    context 'when global_custom_fields is true' do
      it 'returns default fields' do
        permission.update!(global_custom_fields: true)
        expect(requirements_custom_fields.map(&:id)).to eq custom_fields.map(&:id)
        expect(requirements_custom_fields.map(&:required)).to eq [true, false, false]
      end
    end

    context 'when global_custom_fields is false' do
      it 'returns only the permissions fields' do
        permission.update!(global_custom_fields: false)
        expect(requirements_custom_fields.map(&:id)).to eq custom_fields.take(2).map(&:id)
        expect(requirements_custom_fields.map(&:required)).to eq [false, true]
      end
    end
  end
end
