# frozen_string_literal: true

require 'rails_helper'

describe Export::InputFields do
  subject(:form_field_keys) { described_class.new(phase).form_fields.map(&:key) }

  describe '#form_fields' do
    context 'for an ideation phase (form lives on the project)' do
      let(:project) { create(:single_phase_ideation_project) }
      let(:phase) { project.phases.first }
      let!(:custom_form) { create(:custom_form, participation_context: project) }
      let!(:question) { create(:custom_field, resource: custom_form, key: 'q_ideation') }

      before { create(:custom_field_page, resource: custom_form) }

      it 'resolves the fields from the project form' do
        expect(form_field_keys).to include('q_ideation')
      end

      it 'excludes page fields' do
        input_types = described_class.new(phase).form_fields.map(&:input_type)
        expect(input_types).not_to include('page')
      end
    end

    context 'for a native survey phase (form lives on the phase)' do
      let(:phase) { create(:native_survey_phase) }
      let!(:custom_form) { create(:custom_form, participation_context: phase) }
      let!(:question) { create(:custom_field, resource: custom_form, key: 'q_survey') }

      it 'resolves the fields from the phase form' do
        expect(form_field_keys).to include('q_survey')
      end
    end

    context 'for a proposals phase (form lives on the phase, not the project)' do
      let(:project) { create(:single_phase_proposals_project) }
      let(:phase) { project.phases.first }
      let!(:phase_form) { create(:custom_form, participation_context: phase) }
      let!(:phase_question) { create(:custom_field, resource: phase_form, key: 'q_phase') }

      it 'resolves the fields from the phase form, not the project form' do
        expect(form_field_keys).to include('q_phase')
      end
    end
  end

  describe '#user_fields / #all' do
    let(:phase) { create(:native_survey_phase) }
    let!(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:question) { create(:custom_field, resource: custom_form, key: 'q_survey') }
    # `custom_field` defaults to a registration (resource_type User) field.
    let!(:registration_field) { create(:custom_field, key: 'residence', title_multiloc: { 'en' => 'Residence' }) }

    it 'includes out-of-form registration fields in user_fields' do
      expect(described_class.new(phase).user_fields.map(&:key)).to include('residence')
    end

    it 'combines form and user fields in all' do
      expect(described_class.new(phase).all.map(&:key)).to include('q_survey', 'residence')
    end
  end
end
