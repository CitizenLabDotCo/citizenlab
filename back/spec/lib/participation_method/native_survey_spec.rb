# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::NativeSurvey do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:native_survey_phase) }

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

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:native_survey_phase) }

    it 'sets the limits posting to max one' do
      participation_method.assign_defaults_for_phase
      expect(phase.posting_method).to eq 'limited'
      expect(phase.posting_limited_max).to eq 1
    end

    it 'does not change the ideas_order' do
      expect do
        participation_method.assign_defaults_for_phase
      end.not_to change(phase, :ideas_order)
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

      expect(phase_in_db.custom_form.custom_fields.size).to eq 2

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

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
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

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create(:idea_status_proposed) }
      let(:input) { build(:idea, publication_status: nil, idea_status: nil) }

      it 'sets the publication_status to "publised" and the idea_status to "proposed"' do
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

  describe '#never_show?' do
    it 'returns true' do
      expect(participation_method.never_show?).to be true
    end
  end

  describe '#update_if_published?' do
    it 'returns false' do
      expect(participation_method.update_if_published?).to be false
    end
  end

  describe '#custom_form' do
    let(:project_form) { create(:custom_form, participation_context: phase.project) }
    let(:phase) { create(:native_survey_phase) }

    it 'returns the custom form of the phase' do
      expect(participation_method.custom_form.participation_context_id).to eq phase.id
    end
  end

  describe '#sign_in_required_for_posting?' do
    it 'returns false' do
      expect(participation_method.sign_in_required_for_posting?).to be false
    end
  end

  describe '#extra_fields_category_translation_key' do
    it 'returns nil' do
      expect(participation_method.extra_fields_category_translation_key).to be_nil
    end
  end

  describe '#supports_toxicity_detection?' do
    it 'returns false' do
      expect(participation_method.supports_toxicity_detection?).to be false
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

  its(:transitive?) { is_expected.to be false }
  its(:allowed_ideas_orders) { is_expected.to be_empty }
  its(:proposed_budget_in_form?) { is_expected.to be false }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_posting_inputs?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be false }
  its(:supports_commenting?) { is_expected.to be false }
  its(:supports_reacting?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be false }
  its(:supports_permitted_by_everyone?) { is_expected.to be true }
  its(:return_disabled_actions?) { is_expected.to be true }
  its(:additional_export_columns) { is_expected.to eq [] }
end
