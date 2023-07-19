# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::None do
  subject(:participation_method) { described_class.new }

  let(:input) { create(:idea) }

  describe '#assign_defaults_for_participation_context' do
    let(:project) { build(:continuous_project) }

    it 'does not change the posting_method' do
      expect do
        participation_method.assign_defaults_for_participation_context
      end.not_to change(project, :posting_method)
    end

    it 'does not change the ideas_order' do
      expect do
        participation_method.assign_defaults_for_participation_context
      end.not_to change(project, :ideas_order)
    end
  end

  describe '#assign_slug' do
    it 'does not change the input' do
      participation_method.assign_slug input
      expect(input).not_to be_changed
    end
  end

  describe '#create_default_form!' do
    it 'does not create a default form' do
      expect { participation_method.create_default_form! }.not_to change(CustomForm, :count)
    end
  end

  describe '#default_fields' do
    it 'returns an empty list' do
      expect(
        participation_method.default_fields(create(:custom_form)).map(&:code)
      ).to eq []
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
    end
  end

  describe '#author_in_form?' do
    it 'returns false for a moderator when idea_author_change is activated' do
      SettingsService.new.activate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(create(:admin))).to be false
    end
  end

  describe '#budget_in_form?' do
    it 'returns false for a moderator' do
      expect(participation_method.budget_in_form?(create(:admin))).to be false
    end
  end

  describe '#assign_defaults' do
    it 'does not change the input' do
      participation_method.assign_defaults input
      expect(input).not_to be_changed
    end
  end

  describe '#never_show?' do
    it 'returns false' do
      expect(participation_method.never_show?).to be false
    end
  end

  describe '#posting_allowed?' do
    it 'returns false' do
      expect(participation_method.posting_allowed?).to be false
    end
  end

  describe '#never_update?' do
    it 'returns false' do
      expect(participation_method.never_update?).to be false
    end
  end

  describe '#creation_phase?' do
    it 'returns false' do
      expect(participation_method.creation_phase?).to be false
    end
  end

  describe '#edit_custom_form_allowed?' do
    it 'returns true' do
      expect(participation_method.edit_custom_form_allowed?).to be true
    end
  end

  describe '#delete_inputs_on_pc_deletion?' do
    it 'returns false' do
      expect(participation_method.delete_inputs_on_pc_deletion?).to be false
    end
  end

  describe '#sign_in_required_for_posting?' do
    it 'returns false' do
      expect(participation_method.sign_in_required_for_posting?).to be false
    end
  end

  describe '#extra_fields_category_translation_key' do
    it 'returns the translation key for the extra fields category' do
      expect(participation_method.extra_fields_category_translation_key).to eq 'custom_forms.categories.extra.title'
    end
  end

  describe '#supports_toxicity_detection?' do
    it 'returns true' do
      expect(participation_method.supports_toxicity_detection?).to be true
    end
  end

  describe '#include_data_in_email?' do
    it 'returns true' do
      expect(participation_method.include_data_in_email?).to be true
    end
  end

  its(:allowed_ideas_orders) { is_expected.to be_empty }
  its(:supports_exports?) { is_expected.to be false }
  its(:supports_publication?) { is_expected.to be false }
  its(:supports_commenting?) { is_expected.to be false }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be false }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:additional_export_columns) { is_expected.to eq [] }
end
