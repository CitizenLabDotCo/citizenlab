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
        let(:permission) { create(:permission, permitted_by: 'everyone_confirmed_email') }

        before do
          permission.update!(global_custom_fields: false)
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_custom_field, permission: permission, custom_field: field, required: false)
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

        context 'when the action is following' do
          before { permission.update!(permission_scope: nil, action: 'following') }

          it 'does not permit a visitor when password login is enabled' do
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

          it 'does not permit a visitor and returns the requirements for "users" instead when password login is NOT enabled' do
            SettingsService.new.deactivate_feature! 'password_login'

            requirements = service.requirements(permission, nil)
            expect(service.permitted?(requirements)).to be false
            expect(requirements).to eq({
              authentication: {
                permitted_by: 'users',
                missing_user_attributes: %i[first_name last_name email confirmation password]
              },
              verification: false,
              custom_fields: { 'birthyear' => 'optional' },
              onboarding: true,
              group_membership: false
            })
          end
        end
      end

      context 'when permitted_by is set to users' do
        let(:survey_phase) { create(:native_survey_phase, with_permissions: true) }
        let(:permission) do
          permission = survey_phase.permissions.find { |p| p.action == 'posting_idea' }
          permission.permitted_by = 'users'
          permission.global_custom_fields = true
          permission.save!
          permission
        end

        before do
          field = CustomField.find_by code: 'birthyear'
          create(:permissions_custom_field, permission: permission, custom_field: field, required: false)
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

        context 'when user fields are enabled as part of the survey form' do
          it 'does not return any custom fields as part of the requirements' do
            permission.user_fields_in_form = true
            permission.save!
            requirements = service.requirements(permission, nil)
            expect(requirements[:custom_fields]).to be_empty
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
          create(:permissions_custom_field, permission: permission, custom_field: field, required: false)
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

    context 'verification via groups' do
      context 'when permission has groups and permission has a verification group' do
        let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
        let(:group_permission) { create(:permission, permitted_by: 'users', groups: groups) }

        context 'there is no user' do
          it 'requires verification' do
            requirements = service.requirements(group_permission, nil)
            expect(service.permitted?(requirements)).to be false
            expect(requirements[:authentication][:permitted_by]).to eq 'users'
            expect(requirements[:verification]).to be true
          end
        end

        context 'a user is not verified' do
          before { user.update!(verified: false) }

          it 'requires verification' do
            requirements = service.requirements(group_permission, user)
            expect(service.permitted?(requirements)).to be false
            expect(requirements[:authentication][:permitted_by]).to eq 'users'
            expect(requirements[:verification]).to be true
          end
        end

        context 'a user is verified' do
          before { user.update!(verified: true) }

          it 'verification is satisfied' do
            requirements = service.requirements(group_permission, user)
            expect(service.permitted?(requirements)).to be true
            expect(requirements[:authentication][:permitted_by]).to eq 'users'
            expect(requirements[:verification]).to be false
          end
        end
      end

      context 'when permission has a group but is NOT set to a verification group' do
        let(:groups) { [create(:group), create(:smart_group)] }
        let(:group_permission) { create(:permission, permitted_by: 'users', groups: groups) }

        it 'verification is not required' do
          requirements = service.requirements(group_permission, nil)
          expect(requirements[:authentication][:permitted_by]).to eq 'users'
          expect(requirements[:verification]).to be false
        end
      end

      context 'when permission has no groups' do
        let(:permission) { create(:permission, permitted_by: 'users') }

        it 'verification is not required' do
          requirements = service.requirements(permission, nil)
          expect(requirements[:authentication][:permitted_by]).to eq 'users'
          expect(requirements[:verification]).to be false
        end
      end
    end

    context 'verification via permitted_by "verified"' do
      let(:verified_permission) { create(:permission, permitted_by: 'verified') }

      before do
        # To allow permitted_by 'verified' we need to enable at least one verification method
        SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
      end

      context 'there is no user' do
        it 'requires verification' do
          requirements = service.requirements(verified_permission, nil)
          expect(service.permitted?(requirements)).to be false
          expect(requirements[:authentication][:permitted_by]).to eq 'verified'
          expect(requirements[:verification]).to be true
        end
      end

      context 'a user is not verified' do
        before { user.update!(verified: false) }

        it 'requires verification' do
          requirements = service.requirements(verified_permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements[:authentication][:permitted_by]).to eq 'verified'
          expect(requirements[:verification]).to be true
        end

        it 'does not remove missing authentication requirements if not verified' do
          user.update!(unique_code: '1234abcd', email: nil, password: nil)
          requirements = service.requirements(verified_permission, user)
          expect(requirements[:authentication][:missing_user_attributes]).to eq %i[email password]
        end
      end

      context 'a user is verified' do
        before do
          user.update!(verified: true)
          create(:verification, user: user, method_name: 'fake_sso')
        end

        context 'when verification_expiry is nil' do
          it 'verification is satisfied' do
            requirements = service.requirements(verified_permission, user)
            expect(service.permitted?(requirements)).to be true
            expect(requirements[:authentication][:permitted_by]).to eq 'verified'
            expect(requirements[:verification]).to be false
          end

          it 'removes all missing authentication requirements if verified' do
            user.update!(unique_code: '1234abcd', email: nil, password: nil)
            requirements = service.requirements(verified_permission, user)
            expect(requirements[:authentication][:missing_user_attributes]).to be_empty
          end

          it 'removes locked custom fields if verified' do
            verified_permission.update!(global_custom_fields: false)
            create(:permissions_custom_field, custom_field: CustomField.find_by(key: 'gender'), permission: verified_permission, required: true) # locked
            create(:permissions_custom_field, custom_field: CustomField.find_by(key: 'birthyear'), permission: verified_permission, required: true) # locked
            create(:permissions_custom_field, custom_field: create(:custom_field_domicile), permission: verified_permission, required: true) # not locked
            requirements = service.requirements(verified_permission, user)
            expect(requirements[:custom_fields]).to eq({ 'domicile' => 'required' })
          end
        end

        context 'when verification_expiry is set to 0' do
          before { verified_permission.update!(verification_expiry: 0) }

          it 'does not require verification after less than 30 minutes' do
            travel_to Time.now + 15.minutes do
              requirements = service.requirements(verified_permission, user)
              expect(service.permitted?(requirements)).to be true
              expect(requirements[:authentication][:permitted_by]).to eq 'verified'
              expect(requirements[:verification]).to be false
            end
          end

          it 'requires verification again after more than 30 minutes' do
            travel_to Time.now + 30.minutes + 1.second do
              requirements = service.requirements(verified_permission, user)
              expect(service.permitted?(requirements)).to be false
              expect(requirements[:authentication][:permitted_by]).to eq 'verified'
              expect(requirements[:verification]).to be true
            end
          end
        end

        context 'when verification_expiry is set greater than 0' do
          it 'requires verification again after more than a day' do
            verified_permission.update!(verification_expiry: 1)
            travel_to Time.now + 1.day + 1.second do
              requirements = service.requirements(verified_permission, user)
              expect(service.permitted?(requirements)).to be false
              expect(requirements[:authentication][:permitted_by]).to eq 'verified'
              expect(requirements[:verification]).to be true
            end
          end

          it 'does not requires verification before 1 day' do
            verified_permission.update!(verification_expiry: 1)
            travel_to Time.now + 23.hours do
              requirements = service.requirements(verified_permission, user)
              expect(service.permitted?(requirements)).to be true
              expect(requirements[:authentication][:permitted_by]).to eq 'verified'
              expect(requirements[:verification]).to be false
            end
          end

          it 'requires verification again after more than 30 days' do
            verified_permission.update!(verification_expiry: 30)
            travel_to Time.now + 30.days + 1.second do
              requirements = service.requirements(verified_permission, user)
              expect(service.permitted?(requirements)).to be false
              expect(requirements[:authentication][:permitted_by]).to eq 'verified'
              expect(requirements[:verification]).to be true
            end
          end
        end
      end

      context 'a user is verified and has email, but is not confirmed' do
        let(:user) { create(:user_with_confirmation, verified: true) }

        it 'requires email confirmation' do
          expect(user.confirmation_required?).to be true
          requirements = service.requirements(verified_permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements[:authentication][:missing_user_attributes]).to eq ['confirmation']
        end
      end
    end
  end

  describe '#requirements_fields' do
    let(:custom_fields) { [true, false, false].map { |required| create(:custom_field, required: required) } }
    let(:permission) do
      create(:permission).tap do |permission|
        custom_fields.take(2).each do |field|
          create(:permissions_custom_field, permission: permission, custom_field: field, required: !field.required)
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

    context 'when user fields are hidden' do
      it 'does not return hidden fields' do
        permission.update!(global_custom_fields: false)
        hidden_field = custom_fields.first
        hidden_field.update!(hidden: true)
        expect(requirements_custom_fields.map(&:id)).to eq [custom_fields.second.id]
      end
    end
  end
end
