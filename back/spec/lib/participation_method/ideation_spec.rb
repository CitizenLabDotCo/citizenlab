# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Ideation do
  subject(:participation_method) { described_class.new context }

  let(:context) { create(:continuous_project) }

  describe '#assign_defaults_for_participation_context' do
    let(:context) { build(:continuous_project) }

    it 'sets the posting method to unlimited' do
      participation_method.assign_defaults_for_participation_context
      expect(context.posting_method).to eq 'unlimited'
      expect(context.ideas_order).to eq 'trending'
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
    let(:context) do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xc',
          x: { participation_method: 'ideation' },
          c: c
        }
      )
      project.phases.first
    end

    it 'returns false for a resident and a timeline project with a budgeting phase' do
      expect(participation_method.budget_in_form?(create(:user))).to be false
    end

    describe do
      let(:context) { create(:continuous_project, participation_method: 'ideation') }

      it 'returns false for a moderator and a timeline project without a budgeting phase' do
        expect(participation_method.budget_in_form?(create(:admin))).to be false
      end
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

  describe '#never_show?' do
    it 'returns false' do
      expect(participation_method.never_show?).to be false
    end
  end

  describe '#posting_allowed?' do
    it 'returns true' do
      expect(participation_method.posting_allowed?).to be true
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

  describe '#custom_form' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:project_form) { create(:custom_form, participation_context: project) }
    let(:context) { project.phases.first }

    it 'returns the custom form of the project' do
      expect(participation_method.custom_form.participation_context_id).to eq project.id
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
    it 'returns true' do
      expect(participation_method.sign_in_required_for_posting?).to be true
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

  describe 'constraints' do
    it 'has constraints on built in fields to lock certain values from being changed' do
      expect(participation_method.constraints.size).to be 8
      expect(participation_method.constraints.keys).to match_array %i[
        ideation_section1
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
      participation_method.constraints.each do |_key, value|
        expect(value.key?(:locks)).to be true
        valid_locks = %i[enabled required title_multiloc]
        expect(valid_locks).to include(*value[:locks].keys)
      end
    end
  end

  its(:allowed_ideas_orders) { is_expected.to eq %w[trending random popular -new new] }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_publication?) { is_expected.to be true }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_reacting?) { is_expected.to be true }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_assignment?) { is_expected.to be true }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:additional_export_columns) { is_expected.to eq [] }
end
