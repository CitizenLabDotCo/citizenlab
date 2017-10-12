require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Memberships" do
  before do
    header "Content-Type", "application/json"
    @group = create(:group)
    @users = create_list(:user, 5)
    @memberships = @users.map { |u| create(:membership, group: @group, user: u) }
  end

  context "when authenticated" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "api/v1/groups/:group_id/memberships" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of members per page"
      end

      let(:group_id) { @group.id }
      example_request "List all members of a group" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
      end
    
    end

    get "api/v1/memberships/:id" do
      let(:id) { @memberships.first.id }

      example_request "Get one membership by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @memberships.first.id
      end
    end

    post "api/v1/groups/:group_id/memberships" do
      with_options scope: :membership do
        parameter :user_id, "The user id of the group member.", required: true
      end
      ValidationErrorHelper.new.error_fields(self, Membership)

      let(:group_id) { @group.id }
      let(:membership) { build(:membership) }
      let(:user_id) { create(:user).id }

      example_request "Add a group member" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:user,:data,:id)).to eq user_id
        expect(@group.reload.memberships_count).to eq 6
      end
    end

    delete "api/v1/memberships/:id" do
      let(:membership) { create(:membership) }
      let(:id) { membership.id }
      example_request "Delete a membership" do
        expect(response_status).to eq 200
        expect{Membership.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

  end
end 