require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Idea Spam Reports" do
  before do
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @idea = create(:idea)
    @spam_reports = create_list(:spam_report, 2, spam_reportable: @idea)
  end



  get "web_api/v1/ideas/:idea_id/spam_reports" do
    let(:idea_id) { @idea.id }

    example_request "List spam reports of an idea" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/spam_reports/:id" do
    let(:id) { @spam_reports.first.id }

    example_request "Get one spam report by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @spam_reports.first.id
    end
  end

  post "web_api/v1/ideas/:idea_id/spam_reports" do
    with_options scope: :spam_report do
      parameter :user_id, "The user id of the user owning the spam report. Signed in user by default", required: false
      parameter :reason_code, "one of [wrong_content, inapropriate]", required: false
      parameter :other_reason, "The reason for the spam report, if none of the reason codes is applicable", required: false
    end
    ValidationErrorHelper.new.error_fields(self, SpamReport)

  
    let(:idea_id) { @idea.id }
    let(:reason_code) { "inapropriate" }
  
    example_request "Create a spam report on an idea" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:relationships,:user,:data,:id)).to eq @user.id
      expect(json_response.dig(:data,:attributes,:reason_code)).to eq "inapropriate"
    end
  end

  ## TODO update

  delete "web_api/v1/spam_reports/:id" do
    let(:spam_report) { create(:spam_report, user: @user, spam_reportable: @idea) }
    let(:id) { spam_report.id }
    example_request "Delete a spam report" do
      expect(response_status).to eq 200
      expect{SpamReport.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

end
