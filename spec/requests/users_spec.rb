require "rails_helper"

RSpec.describe "Users API", type: :request do
  before :each do
    host! "example.org"
  end

  context "patch" do
    it "returns 200 response if successful"  do
      user = create(:user, name: "Test Guy")
      # set params for the update request
      user_params = {name: 'Test Guy updated'}
      patch endpoint_url_with_id(user.id), params: { user: user_params }

      assert_status(200)
      # assert updated data
      expect(user.reload.name).to eq('Test Guy updated')
    end

    it "returns 422 response if failed to update" do
      user = create(:user, name: "Test Guy")
      # set some invalid data for the request
      user_params = {name: ''}
      patch endpoint_url_with_id(user.id), params: { user: user_params }

      assert_status(422)
    end

    it "returns 404 response if record not found" do
      patch endpoint_url_with_id(123), params: { user: {} }
      assert_status(404)
    end
  end

  def endpoint_url
    "/api/v1/users"
  end

  def endpoint_url_with_id(id)
    "/api/v1/users/#{id}"
  end
end
