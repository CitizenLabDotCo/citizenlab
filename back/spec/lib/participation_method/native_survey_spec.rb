# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::NativeSurvey do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:native_survey_phase, with_permissions: true) }

  describe '#method_str' do
    it 'returns native_survey' do
      expect(described_class.method_str).to eq 'native_survey'
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

  describe '#create_default_form!' do
    it 'persists a default form with a page for the participation context' do
      expect(phase.custom_form).to be_nil

      participation_method.create_default_form!
      # create_default_form! does not reload associations for form/fields/options,
      # so fetch the project from the database. The associations will be fetched
      # when they are needed.
      # Not doing this makes this test flaky, as create_default_form! creates fields
      # and CustomField uses acts_as_list for ordering fields. The ordering is ok
      # in the database, but not necessarily in memory.
      phase_in_db = Phase.find(phase.id)

      expect(phase_in_db.custom_form.custom_fields.size).to eq 3

      question_page = phase_in_db.custom_form.custom_fields[0]
      expect(question_page.title_multiloc).to eq({})
      expect(question_page.description_multiloc).to eq({})

      field = phase_in_db.custom_form.custom_fields[1]
      expect(field.title_multiloc).to match({
        'en' => 'Default question',
        'fr-FR' => 'Question par défaut',
        'nl-NL' => 'Standaardvraag'
      })
      expect(field.description_multiloc).to eq({})
      options = field.options
      expect(options.size).to eq 2
      expect(options[0].key).to eq 'option1'
      expect(options[1].key).to eq 'option2'
      expect(options[0].title_multiloc).to match({
        'en' => 'First option',
        'fr-FR' => 'Première option',
        'nl-NL' => 'Eerste optie'
      })
      expect(options[1].title_multiloc).to match({
        'en' => 'Second option',
        'fr-FR' => 'Deuxième option',
        'nl-NL' => 'Tweede optie'
      })
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

  describe 'constraints' do
    it 'has no constraints' do
      expect(participation_method.constraints).to eq({})
    end
  end

  describe '#custom_form' do
    let(:project_form) { create(:custom_form, participation_context: phase.project) }
    let(:phase) { create(:native_survey_phase) }

    it 'returns the custom form of the phase' do
      expect(participation_method.custom_form.participation_context_id).to eq phase.id
    end
  end

  describe '#supported_email_campaigns' do
    it 'returns campaigns supported for native surveys' do
      expect(participation_method.supported_email_campaigns).to match_array %w[native_survey_not_submitted project_phase_started survey_submitted]
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
        voting_method voting_max_total voting_min_total
        voting_max_votes_per_idea baskets_count votes_count
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

  describe 'user_fields_in_form_frontend_descriptor' do
    let(:permission) { phase.permissions.find_by(action: 'posting_idea') }

    it 'if permitted_by is everyone and data collection is anonymous: returns locked: true, value: nil and explanation' do
      permission.update!(permitted_by: 'everyone', user_data_collection: 'anonymous')
      descriptor = participation_method.user_fields_in_form_frontend_descriptor
      expect(descriptor[:value]).to be_nil
      expect(descriptor[:locked]).to be_truthy
      expect(descriptor[:explanation]).to eq('with_these_settings_cannot_ask_demographic_fields')
    end

    it 'if permitted_by is everyone and data collection is not anonymous: returns locked: true, value: true and explanation' do
      permission.update!(permitted_by: 'everyone', user_data_collection: 'all_data')
      descriptor = participation_method.user_fields_in_form_frontend_descriptor
      expect(descriptor[:value]).to be_truthy
      expect(descriptor[:locked]).to be_truthy
      expect(descriptor[:explanation]).to eq('cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone')
    end

    it 'if permitted_by is not everyone and data collection is anonymous: returns locked: true, value: false and explanation' do
      permission.update!(permitted_by: 'users', user_data_collection: 'anonymous')
      descriptor = participation_method.user_fields_in_form_frontend_descriptor
      expect(descriptor[:value]).to be_falsey
      expect(descriptor[:locked]).to be_truthy
      expect(descriptor[:explanation]).to eq('with_these_settings_can_only_ask_demographic_fields_in_registration_flow')
    end

    # describe 'ideation phase' do
    #   before do
    #     @phase = create(:single_phase_ideation_project).phases.first
    #   end

    #   it 'returns locked: true and not supported explanation if action is not posting idea' do
    #     permission = create(:permission, action: 'commenting_idea', permission_scope: @phase, permitted_by: 'users')
    #     descriptor = permission.user_fields_in_form_frontend_descriptor
    #     expect(descriptor[:value]).to be_nil
    #     expect(descriptor[:locked]).to be_truthy
    #     expect(descriptor[:explanation]).to eq('user_fields_in_survey_not_supported_for_participation_method')
    #   end

    #   it 'if permitted_by is everyone: returns locked: true and value: true' do
    #     permission = create(:permission, action: 'posting_idea', permission_scope: @phase, permitted_by: 'everyone', user_fields_in_form: false)
    #     descriptor = permission.user_fields_in_form_frontend_descriptor
    #     expect(descriptor[:value]).to be_truthy
    #     expect(descriptor[:locked]).to be_truthy
    #     expect(descriptor[:explanation]).to eq('cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone')
    #   end

    #   it 'if permitted_by is not everyone: returns locked: false and whatever user_fields_in_form is' do
    #     permission = create(:permission, action: 'posting_idea', permission_scope: @phase, permitted_by: 'users', user_fields_in_form: false)
    #     descriptor = permission.user_fields_in_form_frontend_descriptor
    #     expect(descriptor[:value]).to be_falsey
    #     expect(descriptor[:locked]).to be_falsey
    #     expect(descriptor[:explanation]).to eq(nil)
    #   end
    # end
  end

  describe '#user_fields_in_form?' do
    let(:permission) { phase.permissions.find_by(action: 'posting_idea') }

    it 'returns false if user_data_collection == \'anonymous\'' do
      permission.update!(user_data_collection: 'anonymous')
      expect(participation_method.user_fields_in_form?).to be false
    end

    context 'when permission permitted_by is \'everyone\'' do
      before do
        permission.update!(permitted_by: 'everyone')
      end

      it 'returns false if no permissions_custom_fields' do
        permission.permissions_custom_fields = []
        permission.save!

        expect(participation_method.user_fields_in_form?).to be false
      end

      it 'returns true if any permissions_custom_fields' do
        permission.permissions_custom_fields = [create(:permissions_custom_field)]
        permission.save!

        expect(participation_method.user_fields_in_form?).to be true
      end
    end

    context 'when permission permitted_by is \'everyone_confirmed_email\'' do
      before do
        permission.permitted_by = 'everyone_confirmed_email'
        permission.save!
      end

      it 'returns true if any permissions_custom_fields and user_fields_in_form selected' do
        permission.permissions_custom_fields = [create(:permissions_custom_field)]
        permission.user_fields_in_form = true
        permission.save!

        expect(participation_method.user_fields_in_form?).to be true
      end

      it 'returns false if no permissions_custom_fields' do
        permission.permissions_custom_fields = []
        permission.user_fields_in_form = true
        permission.save!

        expect(participation_method.user_fields_in_form?).to be false
      end

      it 'returns false if no user_fields_in_form' do
        permission.permissions_custom_fields = [create(:permissions_custom_field)]
        permission.user_fields_in_form = false
        permission.save!

        expect(participation_method.user_fields_in_form?).to be false
      end
    end

    context 'when permission permitted_by is \'users\'' do
      before do
        permission.permitted_by = 'users'
        permission.save!
      end

      it 'returns true if global_custom_fields and user_fields_in_form' do
        permission.permissions_custom_fields = []
        permission.global_custom_fields = true
        permission.user_fields_in_form = true
        permission.save!

        expect(participation_method.user_fields_in_form?).to be true
      end

      it 'returns true if global_custom_fields = false but there are permissions_custom_fields and user_fields_in_form' do
        permission.permissions_custom_fields = [create(:permissions_custom_field)]
        permission.global_custom_fields = false
        permission.user_fields_in_form = true
        permission.save!

        expect(participation_method.user_fields_in_form?).to be true
      end
    end
  end

  its(:additional_export_columns) { is_expected.to eq [] }
  its(:allowed_ideas_orders) { is_expected.to be_empty }
  its(:return_disabled_actions?) { is_expected.to be true }
  its(:supports_assignment?) { is_expected.to be false }
  its(:built_in_title_required?) { is_expected.to be(false) }
  its(:supports_commenting?) { is_expected.to be false }
  its(:supports_edits_after_publication?) { is_expected.to be false }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be false }
  its(:supports_inputs_without_author?) { is_expected.to be true }
  its(:allow_posting_again_after) { is_expected.to be_nil }
  its(:supports_permitted_by_everyone?) { is_expected.to be true }
  its(:supports_public_visibility?) { is_expected.to be false }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be false }
  its(:supports_submission?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be false }
  its(:use_reactions_as_votes?) { is_expected.to be false }
  its(:transitive?) { is_expected.to be false }
  its(:form_logic_enabled?) { is_expected.to be true }
  its(:follow_idea_on_idea_submission?) { is_expected.to be false }
  its(:supports_custom_field_categories?) { is_expected.to be false }
  its(:supports_multiple_phase_reports?) { is_expected.to be false }
  its(:add_autoreaction_to_inputs?) { is_expected.to be(false) }
  its(:everyone_tracking_enabled?) { is_expected.to be false }

  describe 'proposed_budget_in_form?' do # private method
    it 'is expected to be false' do
      expect(participation_method.send(:proposed_budget_in_form?)).to be false
    end
  end
end
