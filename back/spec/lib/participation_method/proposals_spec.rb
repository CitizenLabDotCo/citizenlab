# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Proposals do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:proposals_phase) }
  let(:proposal) { create(:proposal, project: phase.project) }

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:proposals_phase) }

    it 'sets the ideas_order to trending' do
      participation_method.assign_defaults_for_phase
      expect(phase.ideas_order).to eq 'trending'
    end
  end

  describe '#generate_slug' do
    it 'sets and persists the slug of the input' do
      proposal.update_column :slug, nil
      proposal.title_multiloc = { 'en' => 'Changed title' }

      expect(participation_method.generate_slug(proposal)).to eq 'changed-title'
    end
  end

  describe 'constraints' do
    it 'has constraints on built in fields to lock certain values from being changed' do
      expect(participation_method.constraints.keys).to match_array %i[
        ideation_section1
        title_multiloc
        body_multiloc
        idea_images_attributes
        idea_files_attributes
        topic_ids
        location_description
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

  describe '#create_default_form!' do
    it 'creates a default form on the phase level' do
      form = nil
      expect { form = participation_method.create_default_form! }
        .to change(CustomForm, :count).by(1)
        .and change(CustomField, :count).by_at_least(1)

      expect(form.participation_context).to eq phase
    end
  end

  describe '#default_fields' do
    it 'returns the default proposals fields' do
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
    it 'returns false' do
      expect(participation_method.budget_in_form?(create(:admin))).to be false
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

  describe '#update_if_published?' do
    it 'returns true' do
      expect(participation_method.update_if_published?).to be true
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

  its(:transitive?) { is_expected.to be false }
  its(:allowed_ideas_orders) { is_expected.to eq %w[trending random popular -new new] }
  its(:validate_built_in_fields?) { is_expected.to be true }
  its(:proposed_budget_in_form?) { is_expected.to be false }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_publication?) { is_expected.to be true }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_reacting?) { is_expected.to be true }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_assignment?) { is_expected.to be true }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:additional_export_columns) { is_expected.to eq [] }
end
