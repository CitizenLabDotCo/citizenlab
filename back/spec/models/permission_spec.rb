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

  describe '#sanitize_access_denied_explanation_multiloc' do
    it 'removes all HTML tags from access_denied_explanation_multiloc' do
      permission = build(
        :permission,
        access_denied_explanation_multiloc: {
          'en' => 'Something <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      permission.save!

      expect(permission.access_denied_explanation_multiloc['en']).to eq('Something alert("XSS") something')
      expect(permission.access_denied_explanation_multiloc['fr-BE']).to eq('Something ')
      expect(permission.access_denied_explanation_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
