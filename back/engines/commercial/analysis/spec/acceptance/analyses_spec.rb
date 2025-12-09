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
    parameter :project_id, 'Only returns analyses scoped to the project (use for methods where the form lives on the project)', required: false
    parameter :phase_id, 'Only returns anlyses scoped to the phase (use for method where the form lives on the phase)', required: false

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of analyses per page'
    end

    before do
      @survey_analysis = create(:survey_analysis)
      @ideation_analysis = create(:ideation_analysis)
      @proposals_analysis = create(:proposals_analysis)
    end

    example_request 'List all analyses' do
      expect(status).to eq(200)
      expect(response_data.size).to eq 3
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

    example 'List analyses linked to phase (proposals)', document: false do
      do_request(phase_id: @proposals_analysis.phase_id)
      expect(response_data.size).to eq 1
      expect(response_data[0][:id]).to eq @proposals_analysis.id
    end
  end

  get 'web_api/v1/analyses/:id' do
    let(:main_field) { create(:custom_field_text) }
    let(:additional_field) { create(:custom_field_checkbox) }
    let(:analysis) { create(:analysis, main_custom_field: main_field, additional_custom_fields: [additional_field]) }
    let(:id) { analysis.id }

    example_request 'Get one analysis by id' do
      expect(status).to eq 200
      expect(response_data[:id]).to eq analysis.id
      expect(response_data[:attributes]).to match({
        participation_method: 'ideation',
        updated_at: kind_of(String),
        created_at: kind_of(String),
        show_insights: true
      })
      expect(response_data.dig(:relationships, :main_custom_field, :data, :id)).to eq main_field.id
      expect(response_data.dig(:relationships, :additional_custom_fields, :data).pluck(:id)).to eq [additional_field.id]
      expect(json_response_body[:included].pluck(:id)).to include main_field.id
      expect(json_response_body[:included].pluck(:id)).to include additional_field.id
    end
  end

  post 'web_api/v1/analyses' do
    with_options scope: :analysis do
      parameter :project_id, 'The project to analyze, if the custom form lives on the project. Mandatory to pass either project_id or phase_id.', required: false
      parameter :phase_id, 'The phase to analyze, if the custom form lives on the phase. Mandatory to pass either project_id or phase_id.', required: false
      parameter :main_custom_field_id, 'The main custom field to analyze. Must be textual fields. If not passed, only the additional fields will be analyzed.', required: false
      parameter :additional_custom_field_ids, 'The additional custom fields that should be part of the analysis.', required: false
      parameter :show_insights, 'Whether to show insights or not', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Analysis::Analysis)

    describe do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:phase) { project.phases.first }
      let(:phase_id) { phase.id }
      let(:custom_form) { create(:custom_form, participation_context: phase) }
      let(:main_field) { create(:custom_field_text, resource: custom_form) }
      let(:additional_fields) { create_list(:custom_field_checkbox, 2, resource: custom_form) }
      let(:main_custom_field_id) { main_field.id }
      let(:additional_custom_field_ids) { additional_fields.map(&:id) }

      example_request 'Create a phase analysis (survey phase) with specific custom_fields' do
        expect(response_status).to eq 201
        expect(response_data.dig(:relationships, :main_custom_field, :data, :id)).to eq main_field.id
        expect(response_data.dig(:relationships, :additional_custom_fields, :data).size).to eq 2
        expect(response_data.dig(:relationships, :additional_custom_fields, :data).pluck(:id)).to match_array additional_custom_field_ids
      end
    end

    describe do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:project_id) { project.id }

      example_request 'Create a project analysis (ideation phase) when no custom_form exists' do
        expect(response_status).to eq 201
        # If no custom_fields are passed, all textual fields must be added automatically
        additional_custom_field_ids = response_data.dig(:relationships, :additional_custom_fields, :data).pluck(:id)
        expect(additional_custom_field_ids).not_to be_empty
        included_additional_fields = json_response_body[:included].select { |d| additional_custom_field_ids.include? d[:id] }
        expect(included_additional_fields.map { |d| d[:attributes][:code] }).to match_array(%w[title_multiloc body_multiloc location_description])

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

      example_request 'Create a project analysis (ideation phase) when the custom_form already exists' do
        expect(response_status).to eq 201
        # If no custom_fields are passed, all textual fields must be added automatically
        additional_custom_field_ids = response_data.dig(:relationships, :additional_custom_fields, :data).pluck(:id)
        expect(additional_custom_field_ids).not_to be_empty
        included_additional_fields = json_response_body[:included].select { |d| additional_custom_field_ids.include? d[:id] }
        expect(included_additional_fields.map { |d| d[:attributes][:code] }).to match_array(%w[title_multiloc body_multiloc location_description])
      end
    end

    describe do
      let(:project) { create(:single_phase_native_survey_project) }
      let!(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
      let(:project_id) { project.id }

      example_request '[Error] Cannot create a project analysis on project with a single native survey phase' do
        expect(response_status).to eq 422
      end
    end
  end

  patch 'web_api/v1/analyses/:id' do
    with_options scope: :analysis do
      parameter :show_insights, 'Indicates whether to display insights', required: false
      parameter :files, 'Array of file IDs to attach to the analysis', required: false
      parameter :additional_custom_field_ids, 'Array of additional custom field IDs to include in the analysis', required: false

      ValidationErrorHelper.new.error_fields(self, Analysis::Analysis)
    end

    let(:analysis) { create(:analysis) }
    let(:id) { analysis.id }

    describe do
      let(:show_insights) { false }

      example_request 'Update an analysis to hide insights' do
        expect(response_status).to eq 200
        expect(response_data.dig(:attributes, :show_insights)).to be false
      end
    end

    describe do
      let(:additional_field) { create(:custom_field_checkbox) }
      let(:additional_custom_field_ids) { [additional_field.id] }

      example_request 'Update the additional fields of an analysis' do
        expect(response_status).to eq 200
        expect(response_data.dig(:relationships, :additional_custom_fields, :data).pluck(:id)).to match_array additional_custom_field_ids
      end
    end

    example 'Update the attached files of an analysis', document: false do
      files = create_list(:file, 3, projects: [analysis.project])
      before_files = files.first(2)
      after_files = files.last(2)

      analysis.attached_files = before_files
      expect(analysis.attached_files).to match_array(before_files)

      do_request(analysis: { files: after_files.map(&:id) })

      assert_status(200)
      analysis.reload
      expect(analysis.attached_files).to match_array(after_files)
    end

    example '[error] Attach a file from another project to an analysis', document: false do
      file = create(:file)

      do_request(analysis: { files: [file.id] })

      assert_status(422)
      expect(json_response_body.dig(:errors, :file).sole[:error])
        .to eq 'does_not_belong_to_project'
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
