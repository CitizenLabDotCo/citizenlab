require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "ActionDescriptors" do
  explanation "Describe which actions the current user is allowed to take."

  before do
    @current_user = create(:user)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"

    PermissionsService.new.update_global_permissions
  end

  get "web_api/v1/action_descriptors/initiatives" do

    example_request "Find user by (partial) mention" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to eq ({
        posting_initiative: {
          enabled: true,
          disabled_reason: nil
        },
        commenting_initiative: {
          enabled: true,
          disabled_reason: nil
        },
        voting_initiative: {
          enabled: true,
          disabled_reason: nil
        },
        cancelling_initiative_votes: {
          enabled: true,
          disabled_reason: nil
        },
        comment_voting_initiative: {
          enabled: true,
          disabled_reason: nil
        }
      })
    end
  end
end
