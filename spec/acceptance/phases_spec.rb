require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Phases" do

  explanation "Timeline projects constist of multiple phases through which ideas can transit."

  before do
    header "Content-Type", "application/json"
    @project = create(:project)
    @phases = create_list(:phase_sequence, 2, project: @project)
  end

  get "web_api/v1/projects/:project_id/phases" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of phases per page"
    end
    let(:project_id) { @project.id }

    example_request "List all phases of a project" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/phases/:id" do
    let(:id) { @phases.first.id }

    example "Get one phase by id" do
      create_list(:idea, 2, project: @project, phases: @phases)
      do_request
      expect(status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response.dig(:data, :id)).to eq @phases.first.id
      expect(json_response.dig(:data, :type)).to eq 'phase'
      expect(json_response.dig(:data, :attributes)).to include(
        voting_method: 'unlimited',
        ideas_count: 2
        )
      expect(json_response.dig(:data, :relationships)).to include(
        project: {
          data: {id: @phases.first.project_id, type: 'project'}
        },
        permissions: {data: []}
        )
    end
  end

  context "when authenticated" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/projects/:project_id/phases" do
      with_options scope: :phase do
        parameter :title_multiloc, "The title of the phase in nultiple locales", required: true
        parameter :description_multiloc, "The description of the phase in multiple languages. Supports basic HTML.", required: false
        parameter :participation_method, "The participation method of the project, either #{ParticipationContext::PARTICIPATION_METHODS.join(",")}. Defaults to ideation.", required: false
        parameter :posting_enabled, "Can citizens post ideas in this phase? Defaults to true", required: false
        parameter :commenting_enabled, "Can citizens post comment in this phase? Defaults to true", required: false
        parameter :voting_enabled, "Can citizens vote in this phase? Defaults to true", required: false
        parameter :downvoting_enabled, "Can citizens downvote in this phase? Defaults to true", required: false
        parameter :voting_method, "How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(",")}. Defaults to unlimited", required: false
        parameter :voting_limited_max, "Number of votes a citizen can perform in this phase, only if the voting_method is limited. Defaults to 10", required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{ParticipationContext::PRESENTATION_MODES.join(",")}.", required: false
        parameter :survey_embed_url, "The identifier for the survey from the external API, if participation_method is set to survey", required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(",")}", required: false
        parameter :max_budget, "The maximal budget amount each citizen can spend during participatory budgeting.", required: false
        parameter :start_at, "The start date of the phase", required: true
        parameter :end_at, "The end date of the phase", required: true
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :ideas_order, 'The default order of ideas.'
        parameter :input_term, 'The input term for something.'
      end

      ValidationErrorHelper.new.error_fields(self, Phase)
      response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
      response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

      let(:project_id) { @project.id }
      let(:phase) { build(:phase) }
      let(:title_multiloc) { phase.title_multiloc }
      let(:description_multiloc) { phase.description_multiloc }
      let(:participation_method) { phase.participation_method }
      let(:start_at) { phase.start_at }
      let(:end_at) { phase.end_at }

      example_request "Create a phase for a project" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data,:attributes,:participation_method)).to eq participation_method
        expect(json_response.dig(:data,:attributes,:posting_enabled)).to eq true
        expect(json_response.dig(:data,:attributes,:commenting_enabled)).to eq true
        expect(json_response.dig(:data,:attributes,:voting_enabled)).to eq true
        expect(json_response.dig(:data,:attributes,:voting_method)).to eq "unlimited"
        expect(json_response.dig(:data,:attributes,:voting_limited_max)).to eq 10
        expect(json_response.dig(:data,:attributes,:start_at)).to eq start_at.to_s
        expect(json_response.dig(:data,:attributes,:end_at)).to eq end_at.to_s
        expect(json_response.dig(:data,:relationships,:project,:data,:id)).to eq project_id
      end

      describe do
        let(:start_at) { nil }

        example_request "[error] Create an invalid phase", document: false do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :start_at)).to eq [{error: 'blank'}]
        end
      end

      describe do
        before do
          @project.phases.each(&:destroy!)
          create(:phase, project: @project, start_at: Time.now - 2.days, end_at: Time.now + 2.days)
        end
        let(:start_at) { Time.now }
        let(:end_at) { Time.now + 4.days }

        example_request "[error] Create an overlapping phase" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :base)).to eq [{error: 'has_other_overlapping_phases'}]
        end
      end

      describe do
        let(:participation_method) { 'survey' }
        let(:survey_embed_url) { 'https://citizenlabco.typeform.com/to/StrNJP' }
        let(:survey_service) { 'typeform' }

        example_request "Create a survey phase", document: false do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:survey_embed_url)).to eq survey_embed_url
          expect(json_response.dig(:data,:attributes,:survey_service)).to eq survey_service
        end
      end

      describe do
        let(:participation_method) { 'budgeting' }
        let(:max_budget) { 420000 }
        let(:ideas_order) { 'new' }

        example "Create a participatory budgeting phase", document: false do
          do_request
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:max_budget)).to eq max_budget
          expect(json_response.dig(:data,:attributes,:ideas_order)).to be_present
          expect(json_response.dig(:data,:attributes,:ideas_order)).to eq 'new'
          expect(json_response.dig(:data,:attributes,:input_term)).to be_present
          expect(json_response.dig(:data,:attributes,:input_term)).to eq 'idea'
        end
      end

      describe do
        before do
          @project.phases.first.update(
            participation_method: 'budgeting',
            max_budget: 30000
            )
        end
        let(:participation_method) { 'budgeting' }
        let(:max_budget) { 420000 }

        example "[error] Create multiple budgeting phases", document: false do
          do_request
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :base)).to eq [{error: 'has_other_budgeting_phases'}]
        end
      end

      describe do
        let(:description_multiloc) {{
          'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
        }}

        example "Create a phase with text image", document: false do
          ti_count = TextImage.count
          do_request
          expect(response_status).to eq 201
          expect(TextImage.count).to eq (ti_count + 1)
        end

        example "[error] Create a phase with text image without start and end date", document: false do
          ti_count = TextImage.count
          do_request phase: {start_at: nil, end_at: nil}

          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response[:errors].keys & [:start_at, :end_at]).to be_present
          expect(TextImage.count).to eq ti_count
        end
      end
    end

    patch "web_api/v1/phases/:id" do
      with_options scope: :phase do
        parameter :project_id, "The id of the project this phase belongs to"
        parameter :title_multiloc, "The title of the phase in nultiple locales"
        parameter :description_multiloc, "The description of the phase in multiple languages. Supports basic HTML."
        parameter :participation_method, "The participation method of the project, either #{ParticipationContext::PARTICIPATION_METHODS.join(",")}. Defaults to ideation.", required: false
        parameter :posting_enabled, "Can citizens post ideas in this phase?", required: false
        parameter :commenting_enabled, "Can citizens post comment in this phase?", required: false
        parameter :voting_enabled, "Can citizens vote in this phase?", required: false
        parameter :downvoting_enabled, "Can citizens vote in this phase?", required: false
        parameter :voting_method, "How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(",")}", required: false
        parameter :voting_limited_max, "Number of votes a citizen can perform in this phase, only if the voting_method is limited", required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{ParticipationContext::PRESENTATION_MODES.join(",")}.", required: false
        parameter :survey_embed_url, "The identifier for the survey from the external API, if participation_method is set to survey", required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(",")}", required: false
        parameter :max_budget, "The maximal budget amount each citizen can spend during participatory budgeting.", required: false
        parameter :start_at, "The start date of the phase"
        parameter :end_at, "The end date of the phase"
        parameter :poll_anonymous, "Are users associated with their answer? Only applies if participation_method is 'poll'. Can't be changed after first answer.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Phase)
      response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
      response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

      let(:phase) { create(:phase, project: @project) }
      let(:id) { phase.id }
      let(:description_multiloc) { phase.description_multiloc }
      let(:participation_method) { phase.participation_method }
      let(:posting_enabled) { false }
      let(:commenting_enabled) { false }
      let(:voting_enabled) { true }
      let(:voting_method) { 'limited' }
      let(:voting_limited_max) { 6 }
      let(:presentation_mode) { 'map' }

      example_request "Update a phase" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data,:attributes,:participation_method)).to eq participation_method
        expect(json_response.dig(:data,:attributes,:posting_enabled)).to eq posting_enabled
        expect(json_response.dig(:data,:attributes,:commenting_enabled)).to eq commenting_enabled
        expect(json_response.dig(:data,:attributes,:voting_enabled)).to eq voting_enabled
        expect(json_response.dig(:data,:attributes,:voting_method)).to eq voting_method
        expect(json_response.dig(:data,:attributes,:voting_limited_max)).to eq voting_limited_max
        expect(json_response.dig(:data,:attributes,:presentation_mode)).to eq presentation_mode
      end

      describe do
        before do
          @project.phases.first.update(
            participation_method: 'budgeting',
            max_budget: 30000
            )
        end
        let(:ideas) { create_list(:idea, 2, project: @project) }
        let(:phase) { create(:phase, project: @project, participation_method: 'ideation', ideas: ideas) }
        let(:participation_method) { 'information' }

        example "[error] Make a phase with ideas an information phase", document: true do
          do_request
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :base)).to eq [{error: 'cannot_contain_ideas', ideas_count: 2}]
        end
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
