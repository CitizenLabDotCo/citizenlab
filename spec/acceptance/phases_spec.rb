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

    example_request "Get one phase by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response.dig(:data, :id)).to eq @phases.first.id
      expect(json_response.dig(:data, :type)).to eq 'phase'
      expect(json_response.dig(:data, :attributes)).to include(
        voting_method: 'unlimited'
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
        parameter :location_allowed, "Can citizens add a location to their ideas? Defaults to true", required: false
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false        
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

        example "Create a participatory budgeting phase", document: false do
          do_request
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:max_budget)).to eq max_budget
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
      end

      describe do
        let(:title_multiloc) {{"en" => "rdghg", "nl-BE" => "rgdhf","fr-BE" => "drghf"}}
        let(:description_multiloc) {{
          "en" => "<p>ertrhyrhrh</p><p><img src=\"data:image/png;base64,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\"></p><p>sdgfdghf</p>",
          "nl-BE" => "<p>dwefrg</p>",
          "fr-BE" => "<p>ewfrg</p>"
        }}
        let(:participation_method) {'ideation'}
        let(:posting_enabled) {true}
        let(:commenting_enabled) {true}
        let(:voting_enabled) {true}
        let(:location_allowed) {true}
        let(:presentation_mode) {'card'}
        let(:voting_method) {'unlimited'}
        let(:downvoting_enabled) {true}

        example "Create a phase with text image exactly the same", document: false do
          ti_count = TextImage.count
          do_request
          expect(response_status).to eq 201
          expect(TextImage.count).to eq (ti_count + 1)
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
        parameter :location_allowed, "Can citizens add a location to their ideas?", required: false
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
      let(:location_allowed) { false }

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
        expect(json_response.dig(:data,:attributes,:location_allowed)).to eq location_allowed
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
