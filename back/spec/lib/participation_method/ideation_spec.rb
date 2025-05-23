# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Ideation do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:phase) }

  describe '#method_str' do
    it 'returns ideation' do
      expect(described_class.method_str).to eq 'ideation'
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:ideation_proposed) { create(:idea_status_proposed) }
      let!(:proposals_proposed) { create(:proposals_status, code: 'proposed') }
      let!(:initial_status) { create(:idea_status) }

      it 'sets a default "proposed" idea_status if not set' do
        input = build(:idea, idea_status: nil)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq ideation_proposed
      end

      it 'does not change the idea_status if it is already set' do
        initial_status = create(:idea_status)
        input = build(:idea, idea_status: initial_status)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end

    context 'when the proposed idea status is not available' do
      it 'raises ActiveRecord::RecordNotFound when the idea_status is not set' do
        input = build(:idea, idea_status: nil)
        expect { participation_method.assign_defaults input }.to raise_error ActiveRecord::RecordNotFound
      end

      it 'does not change the idea_status if it is already set' do
        create(:idea_status_proposed)
        initial_status = create(:idea_status)
        input = build(:idea, idea_status: initial_status)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end
  end

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:phase) }

    it 'sets the ideas_order to trending' do
      participation_method.assign_defaults_for_phase
      expect(phase.ideas_order).to eq 'trending'
    end

    describe 'when prescreening is activated' do
      before { SettingsService.new.activate_feature! 'prescreening' }

      it 'sets prescreening_enabled to false' do
        participation_method.assign_defaults_for_phase
        expect(phase.prescreening_enabled).to be false
      end
    end
  end

  describe '#generate_slug' do
    let(:input) { create(:idea) }

    it 'sets and persists the slug of the input' do
      input.update_column :slug, nil
      input.title_multiloc = { 'en' => 'Changed title' }

      expect(participation_method.generate_slug(input)).to eq 'changed-title'
    end
  end

  describe '#create_default_form!' do
    it 'creates a default form on the project level' do
      form = nil
      expect { form = participation_method.create_default_form! }
        .to change(CustomForm, :count).by(1)
        .and change(CustomField, :count).by_at_least(1)

      expect(form.participation_context).to eq phase.project
    end
  end

  describe '#default_fields' do
    it 'returns the default ideation fields' do
      expect(
        participation_method.default_fields(create(:custom_form, participation_context: phase)).filter_map(&:code)
      ).to eq %w[
        title_page
        title_multiloc
        body_page
        body_multiloc
        uploads_page
        idea_images_attributes
        idea_files_attributes
        details_page
        topic_ids
        location_description
        proposed_budget
      ]
    end
  end

  describe '#author_in_form?' do
    it 'returns false for a visitor when idea_author_change is activated' do
      SettingsService.new.activate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(nil)).to be false
    end

    it 'returns false for a resident when idea_author_change is activated' do
      SettingsService.new.activate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(create(:user))).to be false
    end

    it 'returns false for a moderator when idea_author_change is deactivated' do
      SettingsService.new.deactivate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(create(:admin))).to be false
    end

    it 'returns true for a moderator when idea_author_change is activated' do
      SettingsService.new.activate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(create(:admin))).to be true
    end
  end

  describe '#budget_in_form?' do
    let(:c) { { participation_method: 'voting', voting_method: 'budgeting' } }
    let(:project) do
      create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xc',
          x: { participation_method: 'ideation' },
          c: c
        }
      )
    end
    let(:phase) { project.phases.first }

    it 'returns false for a resident and a timeline project with a budgeting phase' do
      expect(participation_method.budget_in_form?(create(:user))).to be false
    end

    describe do
      let(:c) { { participation_method: 'ideation' } }

      it 'returns false for a moderator and a timeline project without a budgeting phase' do
        expect(participation_method.budget_in_form?(create(:admin))).to be false
      end
    end

    it 'returns true for a moderator and a timeline project with a budgeting phase' do
      expect(participation_method.budget_in_form?(create(:admin))).to be true
    end
  end

  describe '#custom_form' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:project_form) { create(:custom_form, participation_context: project) }
    let(:phase) { project.phases.first }

    it 'returns the custom form of the project' do
      expect(participation_method.custom_form.participation_context_id).to eq project.id
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

  describe 'constraints' do
    it 'has constraints on built in fields to lock certain values from being changed' do
      expect(participation_method.constraints.size).to be 8
      expect(participation_method.constraints.keys).to match_array %i[
        title_page
        title_multiloc
        body_multiloc
        idea_images_attributes
        idea_files_attributes
        topic_ids
        location_description
        proposed_budget
      ]
    end

    it 'each constraint has locks only on enabled, required & title_multiloc' do
      participation_method.constraints.each_value do |value|
        expect(value.key?(:locks)).to be true
        valid_locks = %i[enabled required title_multiloc]
        expect(valid_locks).to include(*value[:locks].keys)
      end
    end
  end

  its(:additional_export_columns) { is_expected.to eq %w[manual_votes] }
  its(:allowed_ideas_orders) { is_expected.to eq %w[trending random popular -new new comments_count] }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be true }
  its(:supports_built_in_fields?) { is_expected.to be true }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_edits_after_publication?) { is_expected.to be true }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be true }
  its(:supports_inputs_without_author?) { is_expected.to be false }
  its(:allow_posting_again_after) { is_expected.to eq 0.seconds }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:supports_public_visibility?) { is_expected.to be true }
  its(:supports_reacting?) { is_expected.to be true }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_submission?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be true }
  its(:use_reactions_as_votes?) { is_expected.to be false }
  its(:transitive?) { is_expected.to be true }
  its(:supports_private_attributes_in_export?) { is_expected.to be true }
  its(:form_logic_enabled?) { is_expected.to be false }
  its(:follow_idea_on_idea_submission?) { is_expected.to be true }
  its(:validate_phase) { is_expected.to be_nil }
  its(:supports_custom_field_categories?) { is_expected.to be false }
  its(:user_fields_in_form?) { is_expected.to be false }
  its(:supports_multiple_phase_reports?) { is_expected.to be false }
  its(:everyone_tracking_enabled?) { is_expected.to be false }

  describe 'proposed_budget_in_form?' do # private method
    it 'is expected to be true' do
      expect(participation_method.send(:proposed_budget_in_form?)).to be true
    end
  end
end
