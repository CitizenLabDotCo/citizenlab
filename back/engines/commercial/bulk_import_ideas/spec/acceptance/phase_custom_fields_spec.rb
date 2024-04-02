# frozen_string_literal: true

require 'rails_helper'

resource 'Phase level Custom Fields' do
  before do
    admin_header_token
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/phases/:phase_id/importer/export_form/idea/pdf' do
    parameter(:phase_id, 'ID of the phase.')
    parameter(:locale, 'Locale of the downloaded form.')

    let(:locale) { 'en' }
    let(:phase_id) { project.phases.first.id }

    context 'in an ideation phase with form fields' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
      let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

      example 'Get a pdf version of the idea form', document: false do
        do_request
        assert_status 200
      end
    end

    context 'in an active native survey phase with form fields' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
      let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

      example 'Get a pdf version of the native survey form', document: false do
        do_request
        assert_status 200
      end
    end
  end
end
