# frozen_string_literal: true

require 'rails_helper'

resource 'Project level Custom Fields' do
  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/projects/:project_id/custom_fields/to_pdf' do
    parameter(:project_id, 'ID of the project.', required: true)
    parameter(:locale, 'Locale of the downloaded form.', required: true)
    parameter(:phase_id, 'ID of the project.')

    let(:custom_form) { create(:custom_form, participation_context: project) }

    let(:locale) { 'en' }
    let(:project_id) { project.id }

    context 'in an ideation project with a current phase and form fields' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

      example 'Get a pdf version of the idea form', document: false do
        do_request
        assert_status 200
      end
    end

    context 'in a project without a current phase' do
      let(:project) { create(:project_with_two_past_ideation_phases) }

      let(:phase_id) { project.phases.first.id }

      example 'Get a pdf version of the idea form', document: false do
        do_request
        assert_status 200
      end
    end
  end
end
