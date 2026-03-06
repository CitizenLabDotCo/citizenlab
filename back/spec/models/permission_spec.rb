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

  describe 'verification' do
    context 'verification enabled for an action' do
      before { SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] } }

      describe 'permitted_by' do
        it 'can set the verified permitted_by' do
          permission = create(:permission, :by_verified, global_custom_fields: nil)
          expect(permission.permitted_by).to eq('verified')
        end
      end

      describe 'global_custom_fields' do
        it 'is true when created for a "verified" permitted_by' do
          permission = create(:permission, :by_verified, global_custom_fields: nil)
          expect(permission.global_custom_fields).to be_truthy
        end
      end

      describe 'verification_expiry' do
        it 'can set the verification_expiry when permitted_by is "verified"' do
          permission = create(:permission, :by_verified, verification_expiry: 1.day)
          expect(permission.verification_expiry).to eq(1.day)
        end

        it 'cannot set the verification_expiry when permitted_by is not "verified"' do
          expect { create(:permission, :by_users, verification_expiry: 1.day) }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it 'does not cause a problem if set and permitted_by is changed' do
          permission = create(:permission, :by_verified, verification_expiry: 1.day)
          permission.update!(permitted_by: 'users')
          expect(permission.verification_expiry).to eq(1.day)
        end
      end
    end

    context 'verification not enabled for any actions' do
      describe 'permitted_by' do
        it 'returns an error if no methods are enabled' do
          expect { create(:permission, :by_verified, global_custom_fields: nil) }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end
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
