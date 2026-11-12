# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Custom fields' do
  explanation <<~DESC.squish
    Custom fields are the questions asked to users at registration, and the questions of
    input forms (ideation forms and surveys). Answers are listed in the custom field answers
    endpoint.
  DESC

  include_context 'common_auth'

  let_it_be(:project) { create(:project) }
  let_it_be(:ideation_phase) { create(:phase, project: project, start_at: '2026-01-01', end_at: '2026-01-31') }
  let_it_be(:survey_phase) { create(:native_survey_phase, project: project, start_at: '2026-02-01', end_at: '2026-02-28') }
  let_it_be(:project_form) { create(:custom_form, participation_context: project) }
  let_it_be(:survey_form) { create(:custom_form, participation_context: survey_phase) }

  let_it_be(:registration_field) { create(:custom_field_select, :for_registration) }
  let_it_be(:project_field) { create(:custom_field, resource: project_form) }
  let_it_be(:survey_field) { create(:custom_field_linear_scale, resource: survey_form) }
  let_it_be(:other_form_field) { create(:custom_field, :for_custom_form) }
  let_it_be(:page) { create(:custom_field_page, resource: survey_form) }

  get '/api/v2/custom_fields' do
    route_summary 'List custom fields'
    route_description <<~DESC.squish
      Retrieve a paginated list of the questions of the platform, with the most recently
      created ones first. Form pages are not included, as they are not questions.
    DESC

    include_context 'common_list_params'

    parameter(:resource_type, <<~DESC.squish, required: false, in: 'query', type: 'string', enum: PublicApi::V2::CustomFieldsController::RESOURCE_TYPES)
      List only the registration questions ("user") or only the input form questions ("custom-form").
    DESC
    parameter(:project_id, 'List only the questions of the input forms of a project.', required: false, in: 'query', type: 'string')
    parameter(:phase_id, <<~DESC.squish, required: false, in: 'query', type: 'string')
      List only the questions of the form a phase collects inputs with: the survey form of a
      survey phase, or the ideation form of an ideation or voting phase.
    DESC

    example_request 'List all custom fields' do
      assert_status 200
      fields = json_response_body[:custom_fields]

      expect(fields.pluck(:id)).to match_array [registration_field, project_field, survey_field, other_form_field].map(&:id)
      expect(fields.first.keys).to match_array %i[
        id key code input_type ordering required enabled hidden maximum created_at updated_at
        title_multiloc title description_multiloc description resource_type project_id phase_id
      ]

      expect(fields.find { it[:id] == registration_field.id })
        .to include(resource_type: 'user', project_id: nil, phase_id: nil, title: 'Member of councils?')
      expect(fields.find { it[:id] == project_field.id })
        .to include(resource_type: 'custom-form', project_id: project.id, phase_id: nil)
      expect(fields.find { it[:id] == survey_field.id })
        .to include(resource_type: 'custom-form', project_id: project.id, phase_id: survey_phase.id, input_type: 'linear_scale')
    end

    context 'when filtering by resource type' do
      let(:resource_type) { 'user' }

      example_request 'List only the registration questions', document: false do
        assert_status 200
        expect(json_response_body[:custom_fields].pluck(:id)).to eq [registration_field.id]
      end
    end

    context 'when the resource type is invalid' do
      let(:resource_type) { 'idea' }

      example_request 'Returns a bad request error', document: false do
        assert_status 400
        expect(json_response_body[:parameter_name]).to eq 'resource_type'
      end
    end

    context 'when filtering by project' do
      let(:project_id) { project.id }

      example_request 'List only the questions of the forms of the project', document: false do
        assert_status 200
        expect(json_response_body[:custom_fields].pluck(:id)).to contain_exactly(project_field.id, survey_field.id)
      end
    end

    context 'when filtering by phase' do
      let(:phase_id) { survey_phase.id }

      example_request 'List only the questions of the survey form of the phase', document: false do
        assert_status 200
        expect(json_response_body[:custom_fields].pluck(:id)).to eq [survey_field.id]
      end
    end

    context 'when filtering by an ideation phase' do
      let(:phase_id) { ideation_phase.id }

      example_request 'List only the questions of the ideation form of the project', document: false do
        assert_status 200
        expect(json_response_body[:custom_fields].pluck(:id)).to eq [project_field.id]
      end
    end

    context 'when filtering by a phase without a form' do
      let(:phase_id) { create(:phase, project: project, participation_method: 'information', start_at: '2026-03-01', end_at: nil).id }

      example_request 'List no questions', document: false do
        assert_status 200
        expect(json_response_body[:custom_fields]).to be_empty
      end
    end
  end

  get '/api/v2/custom_fields/:id' do
    route_summary 'Get custom field'
    route_description 'Retrieve a single custom field by its ID.'

    include_context 'common_item_params'

    let(:id) { survey_field.id }

    example_request 'Get a custom field' do
      assert_status 200
      expect(json_response_body[:custom_field]).to include(id: survey_field.id, key: survey_field.key)
    end
  end

  include_examples '/api/v2/.../deleted', :custom_fields
end
