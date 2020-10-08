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
    before do
      permission = Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
    end

    example_request "Get the global action descriptors for initiatives" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to eq ({
        posting_initiative: {
          enabled: true,
          disabled_reason: nil
        },
        commenting_initiative: {
          enabled: false,
          disabled_reason: 'not_permitted'
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
          enabled: false,
          disabled_reason: 'not_permitted'
        }
      })
    end
  end
end
