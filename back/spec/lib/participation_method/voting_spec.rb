# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Voting do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:budgeting_phase) }

  describe '#method_str' do
    it 'returns voting' do
      expect(described_class.method_str).to eq 'voting'
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create(:idea_status_proposed) }
      let!(:initial_status) { create(:idea_status) }

      it 'sets a default "proposed" idea_status if not set' do
        input = build(:idea, idea_status: nil)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq proposed
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
        initial_status = create(:idea_status)
        input = build(:idea, idea_status: initial_status)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end
  end

  describe '#assign_defaults_for_phase' do
    context 'budgeting' do
      it 'sets the ideas order to random' do
        participation_method.assign_defaults_for_phase
        expect(phase.ideas_order).to eq 'random'
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
    it 'creates a default form' do
      expect { participation_method.create_default_form! }.to change(CustomForm, :count)
      expect { participation_method.create_default_form! }.to change(CustomField, :count)
    end
  end

  describe '#default_fields' do
    it 'returns the default ideation fields' do
      expect(
        participation_method.default_fields(create(:custom_form, participation_context: phase)).map(&:code)
      ).to eq [
        'title_page',
        'title_multiloc',
        'body_page',
        'body_multiloc',
        'uploads_page',
        'idea_images_attributes',
        'idea_files_attributes',
        'details_page',
        'topic_ids',
        'location_description',
        'proposed_budget',
        nil
      ]
    end
  end

  describe '#author_in_form?' do
    before { SettingsService.new.activate_feature! 'idea_author_change' }

    it 'returns false for a resident when idea_author_change is activated' do
      expect(participation_method.author_in_form?(create(:user))).to be false
    end

    it 'returns true for a moderator when idea_author_change is activated' do
      expect(participation_method.author_in_form?(create(:admin))).to be true
    end
  end

  describe '#budget_in_form?' do
    it 'returns false for a resident and a budgeting phase' do
      expect(participation_method.budget_in_form?(create(:user))).to be false
    end

    it 'returns true for a moderator and a budgeting phase' do
      expect(participation_method.budget_in_form?(create(:admin))).to be true
    end

    describe do
      let(:phase) { create(:budgeting_phase) }

      it 'returns true for a moderator and a budgeting phase' do
        expect(participation_method.budget_in_form?(create(:admin))).to be true
      end
    end
  end

  describe '#custom_form' do
    let(:project) { phase.project }
    let(:project_form) { create(:custom_form, participation_context: project) }

    it 'returns the custom form of the project' do
      expect(participation_method.custom_form.participation_context_id).to eq project.id
    end
  end

  describe '#additional_export_columns' do
    context 'voting method is budgeting' do
      it 'returns [picks, budget]' do
        expect(participation_method.additional_export_columns).to match_array %w[manual_votes picks budget]
      end
    end

    context 'voting method is multiple_voting' do
      let(:phase) { create(:multiple_voting_phase) }

      it 'returns [participants, votes]' do
        expect(participation_method.additional_export_columns).to match_array %w[manual_votes participants votes]
      end
    end

    context 'voting method is single_voting' do
      let(:phase) { create(:single_voting_phase) }

      it 'returns [votes] if voting method is single_voting' do
        expect(participation_method.additional_export_columns).to match_array %w[manual_votes votes]
      end
    end
  end

  describe '#supports_serializing?' do
    # Other attributes are delegated to the voting method
    it 'returns false for the other attributes' do
      %i[native_survey_title_multiloc native_survey_button_multiloc].each do |attribute|
        expect(participation_method.supports_serializing?(attribute)).to be false
      end
    end
  end

  its(:allowed_ideas_orders) { is_expected.to eq ['random'] }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be true }
  its(:built_in_title_required?) { is_expected.to be(true) }
  its(:built_in_body_required?) { is_expected.to be(true) }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_edits_after_publication?) { is_expected.to be true }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be true }
  its(:supports_inputs_without_author?) { is_expected.to be false }
  its(:allow_posting_again_after) { is_expected.to eq 0.seconds }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:supports_public_visibility?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be true }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_submission?) { is_expected.to be false }
  its(:use_reactions_as_votes?) { is_expected.to be false }
  its(:transitive?) { is_expected.to be true }
  its(:supports_private_attributes_in_export?) { is_expected.to be true }
  its(:form_logic_enabled?) { is_expected.to be false }
  its(:follow_idea_on_idea_submission?) { is_expected.to be true }
  its(:supports_custom_field_categories?) { is_expected.to be false }
  its(:user_fields_in_form?) { is_expected.to be false }
  its(:supports_multiple_phase_reports?) { is_expected.to be false }
  its(:add_autoreaction_to_inputs?) { is_expected.to be(false) }
  its(:everyone_tracking_enabled?) { is_expected.to be false }

  describe 'proposed_budget_in_form?' do # private method
    it 'is expected to be true' do
      expect(participation_method.send(:proposed_budget_in_form?)).to be true
    end
  end
end
