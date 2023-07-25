# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Voting do
  subject(:participation_method) { described_class.new context }

  let(:context) { create(:continuous_budgeting_project) }

  describe '#assign_defaults_for_participation_context' do
    context 'budgeting' do
      let(:context) { build(:continuous_budgeting_project) }

      it 'sets the posting method to unlimited and ideas order to random' do
        participation_method.assign_defaults_for_participation_context
        expect(context.posting_method).to eq 'unlimited'
        expect(context.ideas_order).to eq 'random'
      end
    end
  end

  describe '#assign_slug' do
    let(:input) { create(:idea) }

    it 'sets and persists the slug of the input' do
      input.update_column :slug, nil
      input.title_multiloc = { 'en' => 'Changed title' }
      participation_method.assign_slug(input)
      input.reload
      expect(input.slug).to eq 'changed-title'
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
        participation_method.default_fields(create(:custom_form, participation_context: context)).map(&:code)
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
    let(:context) { create(:continuous_budgeting_project) }

    it 'returns false for a resident and a continuous budgeting project' do
      expect(participation_method.budget_in_form?(create(:user))).to be false
    end

    it 'returns true for a moderator and a continuous budgeting project' do
      expect(participation_method.budget_in_form?(create(:admin))).to be true
    end

    describe do
      let(:context) { create(:budgeting_phase) }

      it 'returns true for a moderator and a continuous budgeting project' do
        expect(participation_method.budget_in_form?(create(:admin))).to be true
      end
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create(:idea_status_proposed) }
      let!(:initial_status) { create(:idea_status_implemented) }

      it 'sets a default "proposed" idea_status if not set' do
        input = build(:idea, idea_status: nil)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq proposed
      end

      it 'does not change the idea_status if it is already set' do
        initial_status = create(:idea_status_implemented)
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
        initial_status = create(:idea_status_implemented)
        input = build(:idea, idea_status: initial_status)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end
  end

  describe '#custom_form' do
    let(:project) { context.project }
    let(:project_form) { create(:custom_form, participation_context: context.project) }
    let(:context) { create(:budgeting_phase) }

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
      let(:context) { create(:continuous_budgeting_project) }

      it 'returns [picks, budget]' do
        expect(participation_method.additional_export_columns).to eq %w[picks budget]
      end
    end

    context 'voting method is multiple_voting' do
      let(:context) { create(:continuous_multiple_voting_project) }

      it 'returns [participants, votes]' do
        expect(participation_method.additional_export_columns).to eq %w[participants votes]
      end
    end

    context 'voting method is single_voting' do
      let(:context) { create(:continuous_single_voting_project) }

      it 'returns [votes] if voting method is single_voting' do
        expect(participation_method.additional_export_columns).to eq %w[votes]
      end
    end
  end

  its(:allowed_ideas_orders) { is_expected.to eq ['random'] }
  its(:validate_built_in_fields?) { is_expected.to be true }
  its(:never_show?) { is_expected.to be false }
  its(:posting_allowed?) { is_expected.to be false }
  its(:never_update?) { is_expected.to be false }
  its(:creation_phase?) { is_expected.to be false }
  its(:edit_custom_form_allowed?) { is_expected.to be true }
  its(:delete_inputs_on_pc_deletion?) { is_expected.to be false }
  its(:sign_in_required_for_posting?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be true }
  its(:include_data_in_email?) { is_expected.to be true }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_publication?) { is_expected.to be true }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_assignment?) { is_expected.to be true }
  its(:return_disabled_actions?) { is_expected.to be false }
end
