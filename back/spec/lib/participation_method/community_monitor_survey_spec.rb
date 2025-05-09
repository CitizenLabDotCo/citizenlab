# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::CommunityMonitorSurvey do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:community_monitor_survey_phase) }

  describe '#method_str' do
    it 'returns community_monitor_survey' do
      expect(described_class.method_str).to eq 'community_monitor_survey'
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create(:idea_status_proposed) }
      let(:input) { build(:idea, publication_status: nil, idea_status: nil) }

      it 'sets the publication_status to "published" and the idea_status to "proposed"' do
        participation_method.assign_defaults input
        expect(input.publication_status).to eq 'published'
        expect(input.idea_status).to eq proposed
      end
    end

    context 'when the proposed idea status is not available' do
      let(:input) { build(:idea, idea_status: nil) }

      it 'raises ActiveRecord::RecordNotFound' do
        expect { participation_method.assign_defaults input }.to raise_error ActiveRecord::RecordNotFound
      end
    end
  end

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:native_survey_phase) }

    it 'does not change the ideas_order' do
      expect do
        participation_method.assign_defaults_for_phase
      end.not_to change(phase, :ideas_order)
    end
  end

  describe '#default_fields' do
    it 'returns an empty list if form is persisted' do
      form = create(:custom_form, participation_context: phase)
      expect(participation_method.default_fields(form)).to eq []
    end

    it 'returns the default fields if the form is not persisted' do
      form = build(:custom_form, participation_context: phase)
      expect(participation_method.default_fields(form).count).to eq 15
      expect(participation_method.default_fields(form).pluck(:key)).to eq(%w[
        page_quality_of_life place_to_live sense_of_safety access_to_parks affordable_housing employment_opportunities
        page_service_delivery quality_of_services overall_value cleanliness_and_maintenance
        page_governance_and_trust trust_in_government responsiveness_of_officials transparency_of_money_spent
        form_end
      ])

      # Labels
      expect(participation_method.default_fields(form)[1].linear_scale_label_1_multiloc['en']).to eq 'Very poor'
      expect(participation_method.default_fields(form)[2].linear_scale_label_2_multiloc['en']).to eq 'Poor'
      expect(participation_method.default_fields(form)[3].linear_scale_label_3_multiloc['en']).to eq 'Fair'
      expect(participation_method.default_fields(form)[4].linear_scale_label_4_multiloc['en']).to eq 'Good'
      expect(participation_method.default_fields(form)[5].linear_scale_label_5_multiloc['en']).to eq 'Excellent'

      # Last page
      expect(participation_method.default_fields(form).last.page_button_link).to eq '/'
      expect(participation_method.default_fields(form).last.page_button_label_multiloc).to match(
        { 'en' => 'Back to home', 'fr-FR' => "Retour à l'accueil", 'nl-NL' => 'Terug naar home' }
      )
    end
  end

  describe '#create_default_form!' do
    it 'persists a default form for the phase' do
      expect(phase.custom_form).to be_nil
      participation_method.create_default_form!
      phase_in_db = Phase.find(phase.id)
      expect(phase_in_db.custom_form.custom_fields.size).to eq 15
    end
  end

  describe 'constraints' do
    it 'has constraints on built in fields to lock certain values from being changed' do
      expect(participation_method.constraints.size).to be 3
      expect(participation_method.constraints.keys).to match_array %i[
        page_quality_of_life
        page_service_delivery
        page_governance_and_trust
      ]
    end

    it 'each constraint has locks only title_multiloc' do
      participation_method.constraints.each_value do |value|
        expect(value.key?(:locks)).to be true
        valid_locks = %i[title_multiloc]
        expect(valid_locks).to include(*value[:locks].keys)
      end
    end
  end

  describe '#generate_slug' do
    let(:input) { create(:input, slug: nil, project: phase.project, creation_phase: phase) }

    before { create(:idea_status_proposed) }

    it 'sets and persists the id as the slug of the input' do
      expect(input.slug).to eq input.id

      input.update_column :slug, nil
      input.reload
      expect(participation_method.generate_slug(input)).to eq input.id
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
    let(:project_form) { create(:custom_form, participation_context: phase.project) }
    let(:phase) { create(:native_survey_phase) }

    it 'returns the custom form of the phase' do
      expect(participation_method.custom_form.participation_context_id).to eq phase.id
    end
  end

  describe '#supports_serializing?' do
    it 'returns true for native survey attributes' do
      %i[native_survey_title_multiloc native_survey_button_multiloc].each do |attribute|
        expect(participation_method.supports_serializing?(attribute)).to be true
      end
    end

    it 'returns false for the other attributes' do
      %i[
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea baskets_count
        voting_term_singular_multiloc voting_term_plural_multiloc votes_count
      ].each do |attribute|
        expect(participation_method.supports_serializing?(attribute)).to be false
      end
    end
  end

  describe '#supports_private_attributes_in_export?' do
    it 'returns true if config setting is set to true' do
      config = AppConfiguration.instance
      config.settings['core']['private_attributes_in_export'] = true
      config.save!
      expect(participation_method.supports_private_attributes_in_export?).to be true
    end

    it 'returns false if config setting is set to false' do
      config = AppConfiguration.instance
      config.settings['core']['private_attributes_in_export'] = false
      config.save!
      expect(participation_method.supports_private_attributes_in_export?).to be false
    end

    it 'returns true if the setting is not present' do
      expect(participation_method.supports_private_attributes_in_export?).to be true
    end
  end

  describe '#user_fields_in_form?' do
    it 'returns false when not enabled' do
      expect(participation_method.user_fields_in_form?).to be false
    end

    it 'returns true when enabled' do
      phase.user_fields_in_form = true
      expect(participation_method.user_fields_in_form?).to be true
    end
  end

  describe '#everyone_tracking_enabled?' do
    let(:phase) { create(:community_monitor_survey_phase, with_permissions: true) }

    it 'returns true when enabled on phase and everyone permissions' do
      phase.permissions.first.update!(permitted_by: 'everyone', everyone_tracking_enabled: true)
      expect(participation_method.everyone_tracking_enabled?).to be true
    end

    it 'returns false when not enabled on phase' do
      phase.permissions.first.update!(permitted_by: 'everyone', everyone_tracking_enabled: false)
      expect(participation_method.everyone_tracking_enabled?).to be false
    end

    it 'returns false when phase does not have "everyone" permissions' do
      phase.permissions.first.update!(permitted_by: 'users', everyone_tracking_enabled: true)
      expect(participation_method.everyone_tracking_enabled?).to be false
    end
  end

  its(:additional_export_columns) { is_expected.to eq [] }
  its(:allowed_ideas_orders) { is_expected.to be_empty }
  its(:return_disabled_actions?) { is_expected.to be true }
  its(:supports_assignment?) { is_expected.to be false }
  its(:supports_built_in_fields?) { is_expected.to be false }
  its(:supports_commenting?) { is_expected.to be false }
  its(:supports_edits_after_publication?) { is_expected.to be false }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be false }
  its(:supports_inputs_without_author?) { is_expected.to be true }
  its(:allow_posting_again_after) { is_expected.to eq 3.months }
  its(:supports_permitted_by_everyone?) { is_expected.to be true }
  its(:supports_public_visibility?) { is_expected.to be false }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be false }
  its(:supports_submission?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be false }
  its(:use_reactions_as_votes?) { is_expected.to be false }
  its(:transitive?) { is_expected.to be false }
  its(:form_logic_enabled?) { is_expected.to be false }
  its(:follow_idea_on_idea_submission?) { is_expected.to be false }
  its(:supports_custom_field_categories?) { is_expected.to be true }
  its(:supports_multiple_phase_reports?) { is_expected.to be true }

  describe 'proposed_budget_in_form?' do # private method
    it 'is expected to be false' do
      expect(participation_method.send(:proposed_budget_in_form?)).to be false
    end
  end
end
