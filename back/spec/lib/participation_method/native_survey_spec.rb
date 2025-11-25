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

  describe '#participation_ideas_posted' do
    let(:user1) { create(:user) }
    let!(:idea1) { create(:idea, phases: [phase], created_at: 20.days.ago, published_at: 20.days.ago, author: user1, creation_phase_id: phase.id) } # before phase start
    let!(:idea2) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: user1, creation_phase_id: phase.id) } # during phase
    let!(:idea3) { create(:idea, phases: [phase], created_at: 1.day.ago, published_at: 1.day.ago, author: user1, creation_phase_id: phase.id) } # after phase end

    let(:user2) { create(:user) }
    let!(:idea4) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: user2, creation_phase_id: phase.id) } # during phase
    let!(:idea5) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: nil, author: user2, publication_status: 'draft', creation_phase_id: phase.id) } # during phase, but not published

    let!(:idea6) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: nil, author_hash: 'some_author_hash', creation_phase_id: phase.id) } # during phase, no author (e.g. anonymous participation)
    let!(:idea7) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: nil, author_hash: nil, creation_phase_id: phase.id) } # during phase, no author nor author_hash (e.g. imported idea)

    before { phase.update!(start_at: 15.days.ago, end_at: 2.days.ago) }

    it 'returns the participation ideas posted data for non-transitive ideas created during phase' do
      participation_ideas_posted = participation_method.send(:participation_ideas_posted)

      expect(participation_ideas_posted).to match_array([
        {
          item_id: idea2.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          survey_submitted: true,
          participant_id: user1.id,
          user_custom_field_values: {}
        },
        {
          item_id: idea4.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          survey_submitted: true,
          participant_id: user2.id,
          user_custom_field_values: {}
        },
        {
          item_id: idea5.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          survey_submitted: false,
          participant_id: user2.id,
          user_custom_field_values: {}
        },
        {
          item_id: idea6.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          survey_submitted: true,
          participant_id: 'some_author_hash',
          user_custom_field_values: {}
        },
        {
          item_id: idea7.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          survey_submitted: true,
          participant_id: idea7.id,
          user_custom_field_values: {}
        }
      ])

      first_participation = participation_ideas_posted.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Idea.find(first_participation[:item_id]).created_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participation_ideas_posted = participation_method.send(:participation_ideas_posted)

      expect(participation_ideas_posted.pluck(:item_id)).to match_array([
        idea2.id,
        idea3.id,
        idea4.id,
        idea5.id,
        idea6.id,
        idea7.id
      ])
    end

    it 'includes draft ideas' do
      participation_ideas_posted = participation_method.send(:participation_ideas_posted)

      idea_ids = participation_ideas_posted.map { |p| p[:item_id] }
      expect(idea_ids).to include(idea5.id)
    end

    it 'does not include transitive ideas' do
      idea2.creation_phase_id = nil
      idea2.save!(validate: false) # skip validations to allow setting as transitive idea
      participation_ideas_posted = participation_method.send(:participation_ideas_posted)

      idea_ids = participation_ideas_posted.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea2.id)
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
