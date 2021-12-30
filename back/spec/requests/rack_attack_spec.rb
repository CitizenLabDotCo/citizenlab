require "rails_helper"
require 'rspec_api_documentation/dsl'

describe "Rack::Attack", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  before do
    Rack::Attack.enabled = true
    Rack::Attack.reset!
  end

  after do
    Rack::Attack.enabled = false
  end

  it "limits login requests from same IP to 10 in 20 seconds" do
    headers = { "CONTENT_TYPE" => "application/json" }

    10.times do |i|
      # Use a different email for each request, to avoid testing limit by email
      post "/web_api/v1/user_token", :params => '{ "auth": { "email": "a#{i + 1}@b.com", "password": "test123456" } }', :headers => headers
    end
    expect(status).to eq(404) # Not found

    post "/web_api/v1/user_token", :params => '{ "auth": { "email": "a11@b.com", "password": "test123456" } }', :headers => headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post "/web_api/v1/user_token", :params => '{ "auth": { "email": "a12@b.com", "password": "test123456" } }', :headers => headers
      expect(status).to eq(404) # Not found
    end
  end
  
  it "limits login requests for same email to 10 in 20 seconds" do
    10.times do |i|
      # Use a different IP for each request, to avoid testing limit by IP
      headers = { "CONTENT_TYPE" => "application/json", "REMOTE_ADDR" => "1.2.3.#{i + 1}" }
      post "/web_api/v1/user_token", :params => '{ "auth": { "email": "a@b.com", "password": "test123456" } }', :headers => headers
    end
    expect(status).to eq(404) # Not found

    headers = { "CONTENT_TYPE" => "application/json", "REMOTE_ADDR" => "1.2.3.11" }
    post "/web_api/v1/user_token", :params => '{ "auth": { "email": "a@b.com", "password": "test123456" } }', :headers => headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      headers = { "CONTENT_TYPE" => "application/json", "REMOTE_ADDR" => "1.2.3.12" }
      post "/web_api/v1/user_token", :params => '{ "auth": { "email": "a@b.com", "password": "test123456" } }', :headers => headers
      expect(status).to eq(404) # Not found
    end
  end

  it "limits account creation requests from same IP to 10 in 20 seconds" do
    headers = { "CONTENT_TYPE" => "application/json" }

    10.times do |i|
      # Use a different email for each request, to emulate multiple account creation attempts
      post "/web_api/v1/users", :params => '{ "user": { "email": "a#{i + 1}@b.com", "password": "test123456", "locale": "en", "first_name": "Jane", "last_name": "Doe" } }', :headers => headers
    end
    expect(status).to eq(422) # Unprocessable Entity

    post "/web_api/v1/users", :params => '{ "user": { "email": "a11@b.com", "password": "test123456", "locale": "en", "first_name": "Jane", "last_name": "Doe" } }', :headers => headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post "/web_api/v1/users", :params => '{ "user": { "email": "a12@b.com", "password": "test123456", "locale": "en", "first_name": "Jane", "last_name": "Doe" } }', :headers => headers
      expect(status).to eq(201) # Created
    end
  end

  it "limits password reset email requests from same IP to 10 in 20 seconds" do
    headers = { "CONTENT_TYPE" => "application/json" }

    12.times do |i|
      create(:user, email: "a#{i + 1}@b.com")
    end

    # For some reason, looping and interpolating an email of "a#{i + 1}@b.com" fails with 429 - Too many requests,
    # maybe because it fits 1 'same email' request in 20 seconds rule.
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a1@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a2@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a3@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a4@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a5@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a6@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a7@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a8@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a9@b.com" } }', :headers => headers
    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a10@b.com" } }', :headers => headers
    expect(status).to eq(202) # Accepted

    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a11@b.com" } }', :headers => headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a12@b.com" } }', :headers => headers
      expect(status).to eq(202) # Accepted
    end
  end

  it "limits password reset email requests for same email to 1 in 20 seconds" do
    headers = { "CONTENT_TYPE" => "application/json" }
    create(:user, email: "a@b.com")

    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a@b.com" } }', :headers => headers
    expect(status).to eq(202) # Accepted

    post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a@b.com" } }', :headers => headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post "/web_api/v1/users/reset_password_email", :params => '{ "user": { "email": "a@b.com" } }', :headers => headers
      expect(status).to eq(202) # Accepted
    end
  end

  # it "limits requests to 1000 in 3 minutes" do
  #   1000.times do |i|
  #     get "/web_api/v1/projects"
  #     print "requests made: #{i + 1}\r"
  #     $stdout.flush
  #   end

  #   expect(status).to eq(200)

  #   get "/web_api/v1/projects"
  #   expect(status).to eq(429)

  #   travel_to(3.minutes.from_now) do
  #     get "/web_api/v1/projects"
  #     expect(status).to eq(200)
  #   end
  # end
end
