# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Poll do
  subject(:participation_method) { described_class.new phase }

  let(:input) { create(:idea) }
  let(:phase) { create(:poll_phase) }

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:poll_phase) }

    it 'does not change the posting_method' do
      expect do
        participation_method.assign_defaults_for_phase
      end.not_to change(phase, :posting_method)
    end

    it 'does not change the ideas_order' do
      expect do
        participation_method.assign_defaults_for_phase
      end.not_to change(phase, :ideas_order)
    end
  end

  describe '#generate_slug' do
    it 'does not change the input' do
      expect(participation_method.generate_slug(input)).to be_nil
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
        participation_method.default_fields(create(:custom_form, participation_context: phase)).map(&:code)
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

  describe '#update_if_published?' do
    it 'returns true' do
      expect(participation_method.update_if_published?).to be true
    end
  end

  describe '#custom_form' do
    let(:project) { phase.project }
    let(:project_form) { create(:custom_form, participation_context: phase.project) }

    it 'returns the custom form of the project' do
      expect(participation_method.custom_form.participation_context_id).to eq phase.id
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

  describe '#supports_serializing?' do
    it 'returns false for all attributes' do
      %i[
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea baskets_count
        voting_term_singular_multiloc voting_term_plural_multiloc votes_count
        native_survey_title_multiloc native_survey_button_multiloc
      ].each do |attribute|
        expect(participation_method.supports_serializing?(attribute)).to be false
      end
    end
  end

  its(:transitive?) { is_expected.to be false }
  its(:allowed_ideas_orders) { is_expected.to be_empty }
  its(:proposed_budget_in_form?) { is_expected.to be false }
  its(:supports_presentation_mode?) { is_expected.to be false }
  its(:supports_exports?) { is_expected.to be false }
  its(:supports_posting_inputs?) { is_expected.to be false }
  its(:supports_input_term?) { is_expected.to be false }
  its(:supports_commenting?) { is_expected.to be false }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be false }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:additional_export_columns) { is_expected.to eq [] }
end
