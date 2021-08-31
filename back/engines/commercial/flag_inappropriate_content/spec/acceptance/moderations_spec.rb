require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource 'Moderations' do

  get 'web_api/v1/moderations' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of moderations per page'
    end
    parameter :is_flagged, 'Filter moderations that have been flagged or that are not flagged (boolean)', required: false

    context 'when moderator' do
      before { moderator_scenario }

      example_request 'Moderations include inappropriate content flag' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:included].map{|d| d[:id]}).to include(@flag.id)
        expect(json_response[:included].map{|d| d.dig(:attributes, :toxicity_label)}).to include('insult')
        idea_data = json_response[:data].find{|d| d[:id] == @idea.id}
        expect(idea_data[:relationships].keys).not_to include(:inappropriate_content_flag)
      end

      describe do
        let(:is_flagged) { true }

        example_request 'Filter moderations that are flagged' do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].map{|d| d[:id]}).to match_array [@comment.id]
        end
      end

      describe do
        let(:is_flagged) { false }

        example_request 'Filter moderations that are not flagged' do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].map{|d| d[:id]}).to match_array [@idea.id, @other_idea.id]
        end
      end
    end
  end

  get "web_api/v1/moderations/moderations_count" do
    parameter :is_flagged, 'Filter moderations that have been flagged or that are not flagged (boolean)', required: false

    context "when moderator" do
      before { moderator_scenario }

      describe do
        let(:is_flagged) { true }

        example_request "Count only moderations that are flagged" do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:count]).to eq 1
        end
      end
    end
  end

  def moderator_scenario
    @project = create(:project)
    @moderator = create(:project_moderator, projects: [@project])
    token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
    header 'Authorization', "Bearer #{token}"

    @idea = create(:idea, project: @project)
    @comment = create(:comment, post: @idea)
    @flag = create(:inappropriate_content_flag, flaggable: @comment, toxicity_label: 'insult')
    @other_idea = create(:idea, project: @project)
  end

end
