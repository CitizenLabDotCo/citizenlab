# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::NativeSurvey do
  subject(:participation_method) { described_class.new participation_context }

  let(:participation_context) { create :continuous_native_survey_project }

  describe '#assign_slug' do
    let(:input) { create :input, slug: nil }

    before { create :idea_status_proposed }

    it 'sets and persists the id as the slug of the input' do
      input.update_column :slug, nil
      participation_method.assign_slug(input)
      input.reload
      expect(input.slug).to eq input.id
    end
  end

  describe '#create_default_form!' do
    it 'persists a default form for the participation context' do
      expect(participation_context.custom_form).to be_nil

      participation_method.create_default_form!

      expect(participation_context.custom_form.custom_fields.size).to eq 1
      field = participation_context.custom_form.custom_fields.first
      expect(field.title_multiloc).to match({
        'en' => 'Default question',
        'fr-FR' => 'Question par défaut',
        'nl-NL' => 'Standaardvraag'
      })
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

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create :idea_status_proposed }
      let(:input) { build :idea, publication_status: 'draft', idea_status: nil }

      it 'sets the publication_status to "publised" and the idea_status to "proposed"' do
        participation_method.assign_defaults input
        expect(input.publication_status).to eq 'published'
        expect(input.idea_status).to eq proposed
      end
    end

    context 'when the proposed idea status is not available' do
      let(:input) { build :idea }

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

  describe '#never_update?' do
    it 'returns true' do
      expect(participation_method.never_update?).to be true
    end
  end

  describe '#form_in_phase?' do
    context 'for a timeline project' do
      let(:project) { create :project_with_active_native_survey_phase }
      let(:participation_context) { project.phases.first }

      it 'returns true' do
        expect(participation_method.form_in_phase?).to be true
      end
    end

    context 'for a continuous project' do
      it 'returns false' do
        expect(participation_method.form_in_phase?).to be false
      end
    end
  end

  describe '#edit_custom_form_allowed?' do
    context 'when there are no responses' do
      it 'returns true' do
        expect(participation_method.edit_custom_form_allowed?).to be true
      end
    end

    context 'when there are responses' do
      before do
        IdeaStatus.create_defaults
        create :idea, project: participation_context
      end

      it 'returns false' do
        participation_context.reload
        expect(participation_method.edit_custom_form_allowed?).to be false
      end
    end
  end

  describe '#delete_inputs_on_pc_deletion?' do
    it 'returns true' do
      expect(participation_method.delete_inputs_on_pc_deletion?).to be true
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

  its(:supports_publication?) { is_expected.to be false }
  its(:supports_commenting?) { is_expected.to be false }
  its(:supports_voting?) { is_expected.to be false }
  its(:supports_baskets?) { is_expected.to be false }
  its(:supports_status?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be false }
end
