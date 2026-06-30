# frozen_string_literal: true

require 'rails_helper'

describe Export::Pdf::InputFields do
  subject(:keys) { described_class.new(phase).fields.map(&:key) }

  describe '#fields' do
    context 'for an ideation phase (form lives on the project)' do
      let(:project) { create(:single_phase_ideation_project) }
      let(:phase) { project.phases.first }
      let!(:custom_form) { create(:custom_form, participation_context: project) }
      let!(:question) { create(:custom_field, resource: custom_form, key: 'q_ideation') }

      before { create(:custom_field_page, resource: custom_form) }

      it 'resolves the fields from the project form' do
        expect(keys).to include('q_ideation')
      end

      it 'excludes page fields' do
        input_types = described_class.new(phase).fields.map(&:input_type)
        expect(input_types).not_to include('page')
      end
    end

    context 'for a native survey phase (form lives on the phase)' do
      let(:phase) { create(:native_survey_phase) }
      let!(:custom_form) { create(:custom_form, participation_context: phase) }
      let!(:question) { create(:custom_field, resource: custom_form, key: 'q_survey') }

      it 'resolves the fields from the phase form' do
        expect(keys).to include('q_survey')
      end
    end

    context 'for a proposals phase (form lives on the phase, not the project)' do
      let(:project) { create(:single_phase_proposals_project) }
      let(:phase) { project.phases.first }
      let!(:phase_form) { create(:custom_form, participation_context: phase) }
      let!(:phase_question) { create(:custom_field, resource: phase_form, key: 'q_phase') }

      it 'resolves the fields from the phase form, not the project form' do
        expect(keys).to include('q_phase')
      end
    end
  end
end
