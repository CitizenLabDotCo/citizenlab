# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analyses' do
  explanation 'Analyses are the parent resources to contain textual, AI assisted sensemaking of inputs'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses' do
    parameter :project_id, 'Only returns analyses scoped to the project (use for ideation-like methods)', required: false
    parameter :phase_id, 'Only returns anlyses scoped to the phase (use for survey-like methods)', required: false

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of analyses per page'
    end

    before do
      @survey_analysis = create(:survey_analysis)
      @ideation_analysis = create(:ideation_analysis)
    end

    example_request 'List all analyses' do
      expect(status).to eq(200)
      expect(response_data.size).to eq 2
    end

    example 'List analyses linked to project (ideation)', document: false do
      do_request(project_id: @ideation_analysis.project_id)
      expect(response_data.size).to eq 1
      expect(response_data[0][:id]).to eq @ideation_analysis.id
    end

    example 'List analyses linked to phase (survey)', document: false do
      do_request(phase_id: @survey_analysis.phase_id)
      expect(response_data.size).to eq 1
      expect(response_data[0][:id]).to eq @survey_analysis.id
    end
  end

  get 'web_api/v1/analyses/:id' do
    let(:analysis) { create(:ideation_analysis, :with_custom_field) }
    let(:id) { analysis.id }

    example_request 'Get one analysis by id' do
      expect(status).to eq 200
      expect(response_data[:id]).to eq analysis.id
      expect(response_data[:attributes]).to match({
        participation_method: 'ideation',
        updated_at: kind_of(String),
        created_at: kind_of(String)
      })
      expect(response_data.dig(:relationships, :custom_fields, :data, 0, :id)).to eq analysis.custom_fields.first.id
      expect(json_response_body.dig(:included, 0, :id)).to eq analysis.custom_fields.first.id
    end
  end

  post 'web_api/v1/analyses' do
    with_options scope: :analysis do
      parameter :project_id, 'The project to analyze, only in case of ideation or continuous survey. Mandatory to pass either project_id or phase_id.', required: false
      parameter :phase_id, 'The phase to analyze, only in case of survey. Mandatory to pass either project_id or phase_id.', required: false
      parameter :custom_field_ids, 'Custom fields that should be part of the analysis. Must be textual fields. If not passed, all textual fields will be analyzed.', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Analysis::Analysis)

    describe do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:project_id) { project.id }

      example_request 'Create an analysis (ideation phase) when no custom_form exists' do
        expect(response_status).to eq 201
        # If no custom_fields are passed, all textual fields must be added automatically
        expect(response_data.dig(:relationships, :custom_fields, :data)).not_to be_empty
        expect(json_response_body[:included].map { |d| d[:attributes][:code] }).to match_array(%w[title_multiloc body_multiloc location_description])

        # Example tags must be present
        tags = Analysis::Analysis.find(response_data[:id]).tags
        expect(tags.count).to be > 0
        expect(tags.pluck(:tag_type).uniq).to eq ['onboarding_example']
      end
    end

    describe do
      let(:project) { create(:project_with_active_ideation_phase) }
      let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
      let(:project_id) { project.id }

      example_request 'Create an analysis (ideation phase) when the custom_form already exists' do
        expect(response_status).to eq 201
        # If no custom_fields are passed, all textual fields must be added automatically
        expect(response_data.dig(:relationships, :custom_fields, :data)).not_to be_empty
        expect(json_response_body[:included].map { |d| d[:attributes][:code] }).to match_array(%w[title_multiloc body_multiloc location_description])
      end
    end

    describe do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:phase) { project.phases.first }
      let(:phase_id) { phase.id }
      let(:custom_form) { create(:custom_form, participation_context: phase) }
      let(:custom_field) { create(:custom_field, resource: custom_form) }
      let(:custom_field_ids) { [custom_field.id] }

      example_request 'Create an analysis (survey phase) with specific custom_fields' do
        expect(response_status).to eq 201
        expect(response_data.dig(:relationships, :custom_fields, :data).size).to eq 1
        expect(response_data.dig(:relationships, :custom_fields, :data, 0, :id)).to eq custom_field.id
      end
    end

    describe do
      let(:project) { create(:continuous_native_survey_project) }
      let!(:custom_form) { create(:custom_form, participation_context: project) }
      let(:project_id) { project.id }

      example_request 'Create an analysis (continuous survey project)' do
        expect(response_status).to eq 201
      end
    end
  end

  delete 'web_api/v1/analyses/:id' do
    let!(:analysis) { create(:analysis) }
    let(:id) { analysis.id }

    example 'Delete an analysis' do
      old_count = Analysis::Analysis.count
      do_request
      expect(response_status).to eq 200
      expect { Analysis::Analysis.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect(Analysis::Analysis.count).to eq(old_count - 1)
    end
  end
end
