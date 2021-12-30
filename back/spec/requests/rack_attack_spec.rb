require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'Rack::Attack', type: :request do
  include ActiveSupport::Testing::TimeHelpers

  before do
    Rack::Attack.enabled = true
    Rack::Attack.reset!
  end

  after do
    Rack::Attack.enabled = false
  end

  it 'limits login requests from same IP to 10 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }
    users = create_list(:user, 12)

    # Use a different email for each request, to avoid testing limit by email
    10.times do |i|
      post '/web_api/v1/user_token',
           params: '{ "auth": { "email": "INSERT", "password": "test123456" } }'.gsub('INSERT', users[i].email.to_s),
           headers: headers
    end
    expect(status).to eq(404) # Not found

    post '/web_api/v1/user_token',
         params: '{ "auth": { "email": "INSERT", "password": "test123456" } }'.gsub('INSERT', users[10].email.to_s),
         headers: headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/user_token',
           params: '{ "auth": { "INSERT": "a12@b.com", "password": "test123456" } }'
             .gsub('INSERT', users[11].email.to_s),
           headers: headers
      expect(status).to eq(404) # Not found
    end
  end

  it 'limits login requests for same email to 10 in 20 seconds' do
    # Use a different IP for each request, to avoid testing limit by IP
    10.times do |i|
      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => "1.2.3.#{i + 1}" }
      post '/web_api/v1/user_token',
           params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
           headers: headers
    end
    expect(status).to eq(404) # Not found

    headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.11' }
    post '/web_api/v1/user_token',
         params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
         headers: headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.12' }
      post '/web_api/v1/user_token',
           params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
           headers: headers
      expect(status).to eq(404) # Not found
    end
  end

  it 'limits account creation requests from same IP to 10 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }

    # Use a different email for each request, to emulate multiple account creation attempts
    10.times do |i|
      post '/web_api/v1/users',
           params: '{ "user": { "email": "INSERT",
                                "password": "test123456",
                                "locale": "en",
                                "first_name": "Jane",
                                "last_name": "Doe" }
                    }'.gsub('INSERT', "a#{i + 1}@b.com"),
           headers: headers
    end
    expect(status).to eq(201) # Created

    post '/web_api/v1/users',
         params: '{ "user": { "email": "a11@b.com",
                              "password": "test123456",
                              "locale": "en",
                              "first_name": "Jane",
                              "last_name": "Doe" }
                  }',
         headers: headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/users',
           params: '{ "user": { "email": "a12@b.com",
                                "password": "test123456",
                                "locale": "en",
                                "first_name": "Jane",
                                "last_name": "Doe" }
                    }',
           headers: headers
      expect(status).to eq(201) # Created
    end
  end

  it 'limits password reset email requests from same IP to 10 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }
    users = create_list(:user, 12)

    # Use a different email for each request, to avoid testing limit by email
    10.times do |i|
      post '/web_api/v1/users/reset_password_email',
           params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[i].email.to_s),
           headers: headers
    end

    expect(status).to eq(202) # Accepted

    post '/web_api/v1/users/reset_password_email',
         params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[10].email.to_s),
         headers: headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/users/reset_password_email',
           params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[11].email.to_s),
           headers: headers
      expect(status).to eq(202) # Accepted
    end
  end

  it 'limits password reset email requests for same email to 1 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }
    create(:user, email: 'a@b.com')

    post '/web_api/v1/users/reset_password_email', params: '{ "user": { "email": "a@b.com" } }', headers: headers
    expect(status).to eq(202) # Accepted

    post '/web_api/v1/users/reset_password_email', params: '{ "user": { "email": "a@b.com" } }', headers: headers
    expect(status).to eq(429) # Too many requests

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/users/reset_password_email', params: '{ "user": { "email": "a@b.com" } }', headers: headers
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
