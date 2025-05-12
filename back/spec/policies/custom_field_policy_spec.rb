require 'rails_helper'

describe CustomFieldPolicy do
  let(:scope) { CustomFieldPolicy::Scope.new(user, CustomField.where(custom_form_id: custom_form.id), custom_form) }

  let(:custom_form) { create(:custom_form) }
  let(:visible_field) { create(:custom_field, hidden: false, enabled: true, custom_form: custom_form) }
  let(:disabled_field) { create(:custom_field, hidden: false, enabled: false, custom_form: custom_form) }
  let(:hidden_field) { create(:custom_field, hidden: true, enabled: true, custom_form: custom_form) }

  context 'for a visitor who cannot see the form context' do
    let(:user) { nil }
    let(:custom_form) { create(:custom_form, participation_context: create(:private_admins_project)) }

    it 'does not index any field' do
      expect(scope.resolve.size).to eq 0
    end
  end

  # visitor cannot see project
  # visitor can see project
  # moderator can moderate form
  # moderator cannot moderate form
  # admin for registration fields
end
