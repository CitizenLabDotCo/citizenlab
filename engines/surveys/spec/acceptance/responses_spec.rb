require "rails_helper"
require "rspec_api_documentation/dsl"

resource "Survey Responses" do

  explanation "One survey response contains all the answers of a single user on a survey"

  before do
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get 'web_api/v1/projects/:participation_context_id/survey_responses/as_xlsx' do
    let(:pc) { create(:continuous_survey_project) }
    let(:participation_context_id) { pc.id }
    let!(:responses) { create_list(:survey_response, 3, participation_context: pc)}

    example_request "XLSX export survey responses from continuous project" do
      expect(status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet.count).to eq responses.size+1
    end
  end

  get 'web_api/v1/phases/:participation_context_id/survey_responses/as_xlsx' do
    let(:pc) { create(:phase, participation_method: 'survey', survey_service: 'typeform', survey_embed_url: "https://citizenlabco.typeform.com/to/HKGaPV") }
    let(:participation_context_id) { pc.id }
    let!(:responses) { create_list(:survey_response, 2, participation_context: pc)}

    example_request "XLSX export survey responses from phase" do
      expect(status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet.count).to eq responses.size+1
    end
  end

end