# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Volunteering do
  subject(:participation_method) { described_class.new phase }

  let(:input) { create(:idea) }
  let(:phase) { create(:volunteering_phase) }

  describe '#method_str' do
    it 'returns volunteering' do
      expect(described_class.method_str).to eq 'volunteering'
    end
  end

  describe '#assign_defaults' do
    it 'does not change the input' do
      participation_method.assign_defaults input
      expect(input).not_to be_changed
    end
  end

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:volunteering_phase) }

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

  describe '#custom_form' do
    let(:project) { phase.project }
    let(:project_form) { create(:custom_form, participation_context: project) }

    it 'returns the custom form of the project' do
      expect(participation_method.custom_form.participation_context_id).to eq phase.id
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

  its(:additional_export_columns) { is_expected.to eq [] }
  its(:allowed_ideas_orders) { is_expected.to be_empty }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be false }
  its(:built_in_title_required?) { is_expected.to be(false) }
  its(:built_in_body_required?) { is_expected.to be(false) }
  its(:supports_commenting?) { is_expected.to be false }
  its(:supports_edits_after_publication?) { is_expected.to be true }
  its(:supports_exports?) { is_expected.to be false }
  its(:supports_input_term?) { is_expected.to be false }
  its(:supports_inputs_without_author?) { is_expected.to be true }
  its(:allow_posting_again_after) { is_expected.to eq 0.seconds }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:supports_public_visibility?) { is_expected.to be false }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be false }
  its(:supports_submission?) { is_expected.to be false }
  its(:supports_toxicity_detection?) { is_expected.to be true }
  its(:use_reactions_as_votes?) { is_expected.to be false }
  its(:transitive?) { is_expected.to be false }
  its(:supports_private_attributes_in_export?) { is_expected.to be false }
  its(:form_logic_enabled?) { is_expected.to be false }
  its(:follow_idea_on_idea_submission?) { is_expected.to be false }
  its(:validate_phase) { is_expected.to be_nil }
  its(:supports_custom_field_categories?) { is_expected.to be false }
  its(:user_fields_in_form?) { is_expected.to be false }
  its(:supports_multiple_phase_reports?) { is_expected.to be false }
  its(:add_autoreaction_to_inputs?) { is_expected.to be(false) }
  its(:everyone_tracking_enabled?) { is_expected.to be false }

  describe 'proposed_budget_in_form?' do # private method
    it 'is expected to be false' do
      expect(participation_method.send(:proposed_budget_in_form?)).to be false
    end
  end
end
