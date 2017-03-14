require "rails_helper"

RSpec.describe "Users API", type: :request do
  before :each do
    host! "example.org"
  end

  def endpoint_url
    "/api/v1/users"
  end

  def endpoint_url_with_id(id)
    "/api/v1/users/#{id}"
  end

  context "post" do
    it "returns 200 response if successful"  do
      user_params = {
        name: 'Test Guy',
        email: 'testguy@gmail.com',
        password: 'pass1234',
      }
      post endpoint_url, params: { user: user_params }

      assert_status(201)
      result = json_parse(response.body)
      expect(result[:data][:id]).to_not be_blank
    end

    it "returns 200 response if successful with avatar image"  do
      user_params = {
        name: 'Test Guy',
        email: 'testguy@gmail.com',
        password: 'pass1234',
        avatar: get_avatar_image,
      }
      post endpoint_url, params: { user: user_params }

      assert_status(201)
      result = json_parse(response.body)
      expect(result[:data][:id]).to_not be_blank
      expect(result[:data][:attributes][:avatar]).to_not be_blank
    end
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

    context "when changing password" do
      it "returns 200 response if successful"  do
        old_password = "pass1234"
        user = create(:user, password: old_password)

        new_password = "newpass1234"
        user_params = { password: new_password }
        patch endpoint_url_with_id(user.id), params: { user: user_params }

        assert_status(200)
        user.reload
        expect(user.authenticate(old_password)).to eq false
        expect(user.authenticate(new_password)).to_not eq false
      end
    end
  end

  def get_avatar_image
    filename = Rails.root.join('spec', 'fixtures', 'robot.jpg')
    Rack::Test::UploadedFile.new(filename, "image/jpg", true)
  end
end
