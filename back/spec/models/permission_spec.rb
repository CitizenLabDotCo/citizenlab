# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:permission)).to be_valid
    end
  end

  describe 'global_custom_fields' do
    context 'everyone' do
      it 'is true when created' do
        permission = create(:permission, :by_everyone)
        expect(permission.global_custom_fields).to be_truthy
      end
    end

    context 'everyone_confirmed_email' do
      it 'is true when created' do
        permission = create(:permission, :by_everyone_confirmed_email)
        expect(permission.global_custom_fields).to be_truthy
      end
    end

    context 'user' do
      it 'is true when created' do
        permission = create(:permission, :by_users, global_custom_fields: nil)
        expect(permission.global_custom_fields).to be_truthy
      end
    end
  end

  describe 'scopes' do
    context 'ideation' do
      let(:phase) { create(:phase) }
      let!(:permission_commenting) { create(:permission, action: 'commenting_idea', permission_scope: phase) }
      let!(:permission_posting) { create(:permission, action: 'posting_idea', permission_scope: phase) }
      let!(:permission_reacting) { create(:permission, action: 'reacting_idea', permission_scope: phase) }

      it 'Returns permissions in the correct order' do
        permissions = described_class.order_by_action(phase)
        expect(permissions).to eq([permission_posting, permission_commenting, permission_reacting])
      end

      it 'Only returns permissions that are enabled in a phase' do
        phase.update!(reacting_enabled: false)
        permissions = described_class.filter_enabled_actions(phase)
        expect(permissions.size).to eq(2)
        expect(permissions).not_to include(permission_reacting)
      end
    end

    context 'native survey' do
      let(:phase) { create(:native_survey_phase, submission_enabled: false) }
      let!(:permission_posting) { create(:permission, action: 'posting_idea', permission_scope: phase) }

      it 'Returns all permissions for native surveys even if survey is not open to responses' do
        permissions = described_class.filter_enabled_actions(phase)
        expect(permissions.size).to eq(1)
        expect(permissions).to include(permission_posting)
      end
    end
  end

  describe 'default values' do
    it 'defaults the authentication requirements' do
      permission = described_class.new
      expect(permission.require_confirmed_email).to be true
      expect(permission.require_name).to be true
      expect(permission.require_password).to be true
      expect(permission.require_verification).to be false
      expect(permission.confirmed_email_expiry).to be_nil
    end
  end

  describe 'permitted_by' do
    it 'is valid for everyone, users and admins_moderators' do
      %w[everyone users admins_moderators].each do |value|
        expect(build(:permission, permitted_by: value)).to be_valid
      end
    end

    it 'is no longer valid for the removed everyone_confirmed_email value' do
      expect(build(:permission, permitted_by: 'everyone_confirmed_email')).not_to be_valid
    end

    it 'is no longer valid for the removed verified value' do
      expect(build(:permission, permitted_by: 'verified')).not_to be_valid
    end

    it "is valid as 'everyone' when the action is 'posting_idea' and the method supports it" do
      expect(build(:permission, permitted_by: 'everyone', action: 'posting_idea')).to be_valid
    end

    it "is valid as 'everyone' for 'taking_survey' on an external survey phase" do
      permission = build(:permission, permitted_by: 'everyone', action: 'taking_survey', permission_scope: create(:typeform_survey_phase))
      expect(permission).to be_valid
    end

    it "is invalid as 'everyone' for global (scope-less) permissions" do
      permission = build(:global_permission, permitted_by: 'everyone', action: 'visiting')
      expect(permission).not_to be_valid
      expect(permission.errors.details[:permitted_by]).to include(error: :everyone_not_allowed_for_action)
    end

    it "is invalid as 'everyone' when the action does not allow it" do
      permission = build(:permission, permitted_by: 'everyone', action: 'commenting_idea')
      expect(permission).not_to be_valid
      expect(permission.errors.details[:permitted_by]).to include(error: :everyone_not_allowed_for_action)
    end

    it "allows other permitted_by values for actions that do not allow 'everyone'" do
      expect(build(:permission, permitted_by: 'users', action: 'commenting_idea')).to be_valid
    end
  end

  describe 'following permission default' do
    it 'defaults to a users permission that only requires a confirmed email' do
      permission = create(:global_permission, action: 'following', permitted_by: nil)
      expect(permission.permitted_by).to eq('users')
      expect(permission.require_confirmed_email).to be true
      expect(permission.require_name).to be false
      expect(permission.require_password).to be false
    end
  end

  describe 'require_confirmed_email' do
    it 'can be required when password login signup is enabled' do
      permission = create(:permission, :by_users, require_confirmed_email: false)
      permission.update!(require_confirmed_email: true)
      expect(permission.reload.require_confirmed_email).to be true
    end

    it 'cannot be required when the password_login feature is not activated' do
      permission = create(:permission, :by_users, require_confirmed_email: false)
      SettingsService.new.deactivate_feature!('password_login')
      expect { permission.update!(require_confirmed_email: true) }.to raise_error(ActiveRecord::RecordInvalid)
    end

    it 'cannot be required when password login signup is disabled' do
      permission = create(:permission, :by_users, require_confirmed_email: false)
      config = AppConfiguration.instance
      config.settings['password_login']['enable_signup'] = false
      config.save!
      expect { permission.update!(require_confirmed_email: true) }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe 'require_verification' do
    context 'when a verification method is enabled' do
      before do
        AppConfiguration.instance.settings['id_config'] = { 'allowed' => true, 'enabled' => true, 'id_methods' => [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
        AppConfiguration.instance.save!
      end

      it 'can be required' do
        permission = create(:permission, :by_users, require_verification: true)
        expect(permission.require_verification).to be true
      end
    end

    context 'when no verification method is enabled' do
      it 'cannot be required' do
        expect { create(:permission, :by_users, require_verification: true) }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end

  describe 'verification' do
    context 'when a verification method is enabled' do
      before do
        AppConfiguration.instance.settings['id_config'] = { 'allowed' => true, 'enabled' => true, 'id_methods' => [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
        AppConfiguration.instance.save!
      end

      describe 'global_custom_fields' do
        it 'is true when created for a permission that requires verification' do
          permission = create(:permission, :by_verified, global_custom_fields: nil)
          expect(permission.global_custom_fields).to be_truthy
        end
      end

      describe 'verification_expiry' do
        it 'can be set when verification is required' do
          permission = create(:permission, :by_verified, verification_expiry: 1.day)
          expect(permission.verification_expiry).to eq(1.day)
        end

        it 'cannot be set when verification is not required' do
          expect { create(:permission, :by_users, verification_expiry: 1.day) }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it 'does not cause a problem if set and require_verification is later disabled' do
          permission = create(:permission, :by_verified, verification_expiry: 1.day)
          permission.update!(require_verification: false)
          expect(permission.verification_expiry).to eq(1.day)
        end
      end
    end
  end

  describe '#verification_enabled?' do
    it 'is true when require_verification is true' do
      expect(build(:permission, :by_users, require_verification: true).verification_enabled?).to be true
    end

    it 'is false when verification is not required and there is no verification group' do
      expect(build(:permission, :by_users).verification_enabled?).to be false
    end
  end

  describe '#allow_global_custom_fields?' do
    it 'is true only for a users permission' do
      expect(build(:permission, :by_users).allow_global_custom_fields?).to be true
      expect(build(:permission, :by_everyone).allow_global_custom_fields?).to be false
      expect(build(:permission, :by_admins_moderators).allow_global_custom_fields?).to be false
    end
  end

  describe '#user_fields_in_form_descriptor' do
    it 'returns locked: true and explanation if phase is not native_survey, community_monitor or ideation' do
      permission = create(:permission, action: 'taking_poll', permission_scope: create(:poll_phase))
      descriptor = permission.user_fields_in_form_descriptor
      expect(descriptor[:value]).to be_nil
      expect(descriptor[:locked]).to be_truthy
      expect(descriptor[:explanation]).to eq('user_fields_in_form_not_supported_for_action')
    end

    context 'surveys' do
      let(:permission) { create(:permission, action: 'posting_idea', permission_scope: create(:native_survey_phase)) }

      it 'if permitted_by is everyone and data collection is anonymous: returns locked: true, value: nil and explanation' do
        permission.update!(permitted_by: 'everyone', user_data_collection: 'anonymous')
        descriptor = permission.user_fields_in_form_descriptor
        expect(descriptor[:value]).to be_nil
        expect(descriptor[:locked]).to be_truthy
        expect(descriptor[:explanation]).to eq('with_these_settings_cannot_ask_demographic_fields')
      end

      it 'if permitted_by is everyone and data collection is not anonymous: returns locked: true, value: true and explanation' do
        permission.update!(permitted_by: 'everyone', user_data_collection: 'all_data')
        descriptor = permission.user_fields_in_form_descriptor
        expect(descriptor[:value]).to be_truthy
        expect(descriptor[:locked]).to be_truthy
        expect(descriptor[:explanation]).to eq('cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone')
      end

      it 'if permitted_by is not everyone and data collection is anonymous: returns locked: true, value: false and explanation' do
        permission.update!(permitted_by: 'users', user_data_collection: 'anonymous')
        descriptor = permission.user_fields_in_form_descriptor
        expect(descriptor[:value]).to be_falsey
        expect(descriptor[:locked]).to be_truthy
        expect(descriptor[:explanation]).to eq('with_these_settings_can_only_ask_demographic_fields_in_registration_flow')
      end
    end

    context 'ideation' do
      let(:permission) { create(:permission, action: 'posting_idea', permission_scope: create(:ideation_phase)) }

      it 'if permitted_by is everyone: returns locked: true and value: true' do
        permission.update!(permitted_by: 'everyone', user_fields_in_form: false)
        descriptor = permission.user_fields_in_form_descriptor
        expect(descriptor[:value]).to be_truthy
        expect(descriptor[:locked]).to be_truthy
        expect(descriptor[:explanation]).to eq('cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone')
      end

      it 'if permitted_by is not everyone: returns locked: false and whatever user_fields_in_form is' do
        permission.update!(permitted_by: 'users', user_fields_in_form: false)
        descriptor = permission.user_fields_in_form_descriptor
        expect(descriptor[:value]).to be_falsey
        expect(descriptor[:locked]).to be_falsey
        expect(descriptor[:explanation]).to be_nil
      end

      it 'returns locked: true and explanation if action is not posting_idea' do
        permission = create(:permission, action: 'commenting_idea', permission_scope: create(:ideation_phase))
        descriptor = permission.user_fields_in_form_descriptor
        expect(descriptor[:value]).to be_nil
        expect(descriptor[:locked]).to be_truthy
        expect(descriptor[:explanation]).to eq('user_fields_in_form_not_supported_for_action')
      end
    end
  end
end
