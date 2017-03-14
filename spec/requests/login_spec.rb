require 'rails_helper'

RSpec.describe "Login", type: :request do
  before do
    host! "example.org"
    # See Facebook test users
    # https://developers.facebook.com/docs/apps/test-users
    @test_user_access_token = "EAAZAAA1kcpUUBAPXXKABwOjOsQ2hmUpHkA9YC181hdnUD4rIxi7YPT2DuZAHRo0cUeI55eZAytROUvqU6HRNeiZCQsDy7Gaas4TDMdiH28WU4nckunzj0ZCTfiZCWqCJBATeudW7JZAo2RZCYTLcG8yAe7mFnejxF1ZAZAemySmDHFf6yxE7LWY0QfvKHd66zcNjVTTk3P10mEYe7CCiVv8Ymnb7LdUzZBcRBIZD"
    @test_user_email = "test_hwtznfd_user@tfbnw.net"
  end

  describe "Social Login" do
    def endpoint_url
      "/api/v1/social_login"
    end

    context "POST" do
      xit "returns a 400 response for invalid access_token" do
        auth_params = { network: 'facebook', access_token: '123' }
        post endpoint_url, params: { auth: auth_params }

        expect(response.status).to eq 400
      end

      it "returns a jwt token for valid access_token" do
        create(:user, email: @test_user_email)

        auth_params = { network: 'facebook', access_token: @test_user_access_token }
        post endpoint_url, params: { auth: auth_params }

        expect(response.status).to eq 200
        result = json_parse(response.body)
        puts "[DEBUG] result = #{result.inspect}"
        expect(result[:data][:jwt].length).to be > 20
      end

      # TODO: fix this
      xit "returns a 400 response for unregistered user" do
        auth_params = { network: 'facebook', access_token: @test_user_access_token }
        post endpoint_url, params: { auth: auth_params }

        expect(response.status).to eq 400
      end
    end
  end
end
