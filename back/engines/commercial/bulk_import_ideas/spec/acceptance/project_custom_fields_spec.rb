# frozen_string_literal: true

require 'rails_helper'

resource 'Project level Custom Fields' do
  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/projects/:project_id/custom_fields/to_pdf' do
    parameter(:phase_id, 'ID of the phase.')
    parameter(:locale, 'Locale of the downloaded form.')

    let(:locale) { 'en' }

    context 'in an ideation project with form fields' do
      let(:project) { create(:continuous_project) }
      let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

      let(:project_id) { project.id }

      example 'Get a pdf version of the idea form', document: false do
        do_request
        assert_status 200
      end
    end

    context 'in a timeline project with form fields' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
      let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

      let(:project_id) { project.id }

      example 'Get a pdf version of the idea form', document: false do
        do_request
        assert_status 200
      end
    end
  end
end
