# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Proposals do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:proposals_phase) }
  let(:proposal) { create(:proposal, project: phase.project) }

  describe '#method_str' do
    it 'returns proposals' do
      expect(described_class.method_str).to eq 'proposals'
    end
  end

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:proposals_phase) }

    it 'sets the ideas_order to trending' do
      participation_method.assign_defaults_for_phase
      expect(phase.ideas_order).to eq 'trending'
    end

    it 'sets the expire_days_limit to 90' do
      participation_method.assign_defaults_for_phase
      expect(phase.expire_days_limit).to eq 90
    end

    it 'sets the reacting_threshold to 300' do
      participation_method.assign_defaults_for_phase
      expect(phase.reacting_threshold).to eq 300
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
      participation_method.constraints.each_value do |value|
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
    context 'when the proposed status is available' do
      let!(:ideation_proposed) { create(:idea_status_proposed) }
      let!(:proposed_status) { create(:proposals_status, code: 'proposed') }
      let!(:custom_status) { create(:proposals_status) }

      it 'assignes the default "proposed" status if not set' do
        proposal = build(:proposal, idea_status: nil)
        participation_method.assign_defaults proposal
        expect(proposal.idea_status).to eq proposed_status
      end

      it 'does not change the status if it is already set' do
        proposal = build(:proposal, idea_status: custom_status)
        participation_method.assign_defaults proposal
        expect(proposal.idea_status).to eq custom_status
      end
    end

    context 'when the proposed status is not available' do
      it 'raises ActiveRecord::RecordNotFound when the idea_status is not set' do
        input = build(:proposal, idea_status: nil)
        expect { participation_method.assign_defaults input }.to raise_error ActiveRecord::RecordNotFound
      end

      it 'does not change the idea_status if it is already set' do
        create(:proposals_status, code: 'proposed')
        initial_status = create(:proposals_status)
        input = build(:idea, idea_status: initial_status)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end
  end

  describe '#update_if_published?' do # TODO
    it 'returns true' do
      expect(participation_method.update_if_published?).to be true
    end
  end

  describe '#custom_form' do
    it 'returns the custom form of the phase' do
      expect(participation_method.custom_form.participation_context_id).to eq phase.id
    end
  end

  describe '#extra_fields_category_translation_key' do
    it 'returns the translation key for the extra fields category' do
      expect(participation_method.extra_fields_category_translation_key).to eq 'custom_forms.categories.extra.title'
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
  its(:allowed_ideas_orders) { is_expected.to eq %w[trending random popular -new new] }
  its(:validate_built_in_fields?) { is_expected.to be true }
  its(:proposed_budget_in_form?) { is_expected.to be false }
  its(:supports_public_visibility?) { is_expected.to be true }
  its(:supports_posting_inputs?) { is_expected.to be true }
  its(:sign_in_required_for_posting?) { is_expected.to be true }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be true }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_reacting?) { is_expected.to be true }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_assignment?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be true }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:additional_export_columns) { is_expected.to eq [] }
end
