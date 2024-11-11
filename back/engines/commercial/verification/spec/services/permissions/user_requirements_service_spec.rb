# frozen_string_literal: true

require 'rails_helper'

describe Permissions::UserRequirementsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '#requirements' do
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
          let(:user) { create(:user, verified: false) }

          it 'requires verification' do
            requirements = service.requirements(group_permission, user)
            expect(service.permitted?(requirements)).to be false
            expect(requirements[:authentication][:permitted_by]).to eq 'users'
            expect(requirements[:verification]).to be true
          end
        end

        context 'a user is verified' do
          let(:user) { create(:user, verified: true) }

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
        let(:user) { create(:user, verified: false) }

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
        let(:user) { create(:user, verified: true) }

        before { create(:verification, user: user, method_name: 'fake_sso') }

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
            create(:permissions_custom_field, custom_field: create(:custom_field_gender), permission: verified_permission, required: true) # locked
            create(:permissions_custom_field, custom_field: create(:custom_field_birthyear), permission: verified_permission, required: true) # locked
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
end
