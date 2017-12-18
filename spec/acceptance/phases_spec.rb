require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Phases" do

  before do
    header "Content-Type", "application/json"
    @project = create(:project)
    @phases = create_list(:phase, 2, project: @project)
  end

  get "web_api/v1/projects/:project_id/phases" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of phases per page"
    end
    
    let(:project_id) { @project.id }
    example_request "List phases of a project" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/phases/:id" do
    let(:id) { @phases.first.id }

    example_request "Get one phase by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @phases.first.id
    end
  end

  context "when authenticated" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/projects/:project_id/phases" do
      with_options scope: :phase do
        parameter :title_multiloc, "The title of the phase in nultiple locales", required: true
        parameter :description_multiloc, "The description of the phase in multiple languages. Supports basic HTML.", required: false
        parameter :consultation_method, "The consultation method of the project, either #{Phase::CONSULTATION_METHODS.join(",")}."
        parameter :start_at, "The start date of the phase", required: true
        parameter :end_at, "The end date of the phase", required: true
      end
    ValidationErrorHelper.new.error_fields(self, Phase)


      let(:project_id) { @project.id }
      let(:phase) { build(:phase) }
      let(:title_multiloc) { phase.title_multiloc }
      let(:description_multiloc) { phase.description_multiloc }
      let(:consultation_method) { phase.consultation_method }
      let(:start_at) { phase.start_at }
      let(:end_at) { phase.end_at }

      example_request "Create a phase in a project" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data,:attributes,:consultation_method)).to match consultation_method
        expect(json_response.dig(:data,:attributes,:start_at)).to eq start_at.to_s
        expect(json_response.dig(:data,:attributes,:end_at)).to eq end_at.to_s
        expect(json_response.dig(:data,:relationships,:project,:data,:id)).to eq project_id
      end

      describe do
        let (:start_at) { nil }
        example_request "[error] Create an invalid phase" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :start_at)).to eq [{error: 'blank'}]
        end
      end

    end

    patch "web_api/v1/phases/:id" do
      with_options scope: :phase do
        parameter :project_id, "The id of the project this phase belongs to"
        parameter :title_multiloc, "The title of the phase in nultiple locales"
        parameter :description_multiloc, "The description of the phase in multiple languages. Supports basic HTML."
        parameter :consultation_method, "The consultation method of the project, either #{Phase::CONSULTATION_METHODS.join(",")}."
        parameter :start_at, "The start date of the phase"
        parameter :end_at, "The end date of the phase"
      end
    ValidationErrorHelper.new.error_fields(self, Phase)


      let(:phase) { create(:phase, project: @project) }
      let(:id) { phase.id }
      let(:description_multiloc) { build(:phase).description_multiloc }
      let(:consultation_method) { Phase::CONSULTATION_METHODS.last }

      example_request "Update a phase" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data,:attributes,:consultation_method)).to match consultation_method
      end
    end


    delete "web_api/v1/phases/:id" do
      let(:phase) { create(:phase, project: @project) }
      let(:id) { phase.id }
      example_request "Delete a phase" do
        expect(response_status).to eq 200
        expect{Comment.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

  end

end