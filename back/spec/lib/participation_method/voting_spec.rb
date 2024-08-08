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
      ).to eq %w[
        ideation_section1
        title_multiloc
        body_multiloc
        ideation_section2
        idea_images_attributes
        idea_files_attributes
        ideation_section3
        topic_ids
        location_description
        proposed_budget
      ]
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns true' do
      expect(participation_method.validate_built_in_fields?).to be true
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

  describe '#custom_form' do
    let(:project) { phase.project }
    let(:project_form) { create(:custom_form, participation_context: project) }

    it 'returns the custom form of the project' do
      expect(participation_method.custom_form.participation_context_id).to eq project.id
    end
  end

  describe '#extra_fields_category_translation_key' do
    it 'returns the translation key for the extra fields category' do
      expect(participation_method.extra_fields_category_translation_key).to eq 'custom_forms.categories.extra.title'
    end
  end

  describe '#additional_export_columns' do
    context 'voting method is budgeting' do
      it 'returns [picks, budget]' do
        expect(participation_method.additional_export_columns).to eq %w[picks budget]
      end
    end

    context 'voting method is multiple_voting' do
      let(:phase) { create(:multiple_voting_phase) }

      it 'returns [participants, votes]' do
        expect(participation_method.additional_export_columns).to eq %w[participants votes]
      end
    end

    context 'voting method is single_voting' do
      let(:phase) { create(:single_voting_phase) }

      it 'returns [votes] if voting method is single_voting' do
        expect(participation_method.additional_export_columns).to eq %w[votes]
      end
    end
  end

  describe '#supports_serializing?' do
    it 'returns true for voting attributes' do
      %i[
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea baskets_count
        voting_term_singular_multiloc voting_term_plural_multiloc votes_count
      ].each do |attribute|
        expect(participation_method.supports_serializing?(attribute)).to be true
      end
    end

    it 'returns false for the other attributes' do
      %i[native_survey_title_multiloc native_survey_button_multiloc].each do |attribute|
        expect(participation_method.supports_serializing?(attribute)).to be false
      end
    end
  end

  its(:transitive?) { is_expected.to be true }
  its(:allowed_ideas_orders) { is_expected.to eq ['random'] }
  its(:proposed_budget_in_form?) { is_expected.to be true }
  its(:validate_built_in_fields?) { is_expected.to be true }
  its(:supports_public_visibility?) { is_expected.to be true }
  its(:supports_posting_inputs?) { is_expected.to be false }
  its(:update_if_published?) { is_expected.to be true }
  its(:sign_in_required_for_posting?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be true }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be true }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_assignment?) { is_expected.to be true }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:return_disabled_actions?) { is_expected.to be false }
end
