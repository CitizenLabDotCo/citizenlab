# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'Rack::Attack' do
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

    # Use a different email for each request, to avoid testing limit by email
    freeze_time do
      10.times do |i|
        post(
          '/web_api/v1/user_token',
          params: '{ "auth": { "email": "INSERT", "password": "test123456" } }'.gsub('INSERT', "a#{i}@b.com"),
          headers: headers
        )
      end
      expect(status).to eq(404) # Not found

      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a11@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "INSERT": "a12@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(404) # Not found
    end
  end

  it 'limits login requests for same email to 10 in 20 seconds' do
    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      10.times do |i|
        headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => "1.2.3.#{i + 1}" }
        post(
          '/web_api/v1/user_token',
          params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
          headers: headers
        )
      end
      expect(status).to eq(404) # Not found

      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.11' }
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.12' }
      post '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: headers
      expect(status).to eq(404) # Not found
    end
  end

  it 'limits account creation requests from same IP to 10 in 20 seconds' do
    # enable user signup via password first
    settings = AppConfiguration.instance.settings
    settings['password_login'] = {
      'enabled' => true,
      'allowed' => true,
      'enable_signup' => true,
      'minimum_length' => 5,
      'phone' => false
    }
    AppConfiguration.instance.update! settings: settings

    headers = { 'CONTENT_TYPE' => 'application/json' }

    # Use a different email for each request, to emulate multiple account creation attempts
    freeze_time do
      10.times do |i|
        post(
          '/web_api/v1/users',
          params: '{ "user": { "email": "INSERT",
                              "password": "test123456",
                              "locale": "en",
                              "first_name": "Jane",
                              "last_name": "Doe" }
                  }'.gsub('INSERT', "a#{i + 1}@b.com"),
          headers: headers
        )
      end
      expect(status).to eq(201) # Created

      post(
        '/web_api/v1/users',
        params: '{ "user": { "email": "a11@b.com",
                            "password": "test123456",
                            "locale": "en",
                            "first_name": "Jane",
                            "last_name": "Doe" }
                }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

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

  it 'limits password reset requests from same IP to 10 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }

    freeze_time do
      10.times do
        post(
          '/web_api/v1/users/reset_password',
          params: '{ "user": { "password": "new_password", "token": "invalid-token" } }',
          headers: headers
        )
      end
      expect(status).to eq(401) # Unauthorized

      post(
        '/web_api/v1/users/reset_password',
        params: '{ "user": { "password": "new_password", "token": "invalid-token" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/users/reset_password',
        params: '{ "user": { "password": "new_password", "token": "invalid-token" } }',
        headers: headers
      )
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits password reset email requests from same IP to 10 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }
    users = create_list(:user, 12)

    # Use a different email for each request, to avoid testing limit by email
    freeze_time do
      10.times do |i|
        post(
          '/web_api/v1/users/reset_password_email',
          params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[i].email.to_s),
          headers: headers
        )
      end
      expect(status).to eq(202) # Accepted

      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[10].email.to_s),
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

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

    freeze_time do
      post '/web_api/v1/users/reset_password_email', params: '{ "user": { "email": "a@b.com" } }', headers: headers
      expect(status).to eq(202) # Accepted

      post '/web_api/v1/users/reset_password_email', params: '{ "user": { "email": "a@b.com" } }', headers: headers
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/users/reset_password_email', params: '{ "user": { "email": "a@b.com" } }', headers: headers
      expect(status).to eq(202) # Accepted
    end
  end

  it 'limits search requests from same IP to 15 in 20 seconds' do
    freeze_time do
      15.times do
        get '/web_api/v1/initiatives?search=some-random-search-term'
      end
      expect(status).to eq(200) # OK

      get '/web_api/v1/initiatives?search=some-random-search-term'
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      get '/web_api/v1/initiatives?search=some-random-search-term'
      expect(status).to eq(200) # OK
    end
  end

  it 'limits invite acceptance requests from same IP to 10 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }

    freeze_time do
      10.times do
        post(
          '/web_api/v1/invites/by_token/:token/accept',
          params: '{ "user": { "email": "a@b.com",
                              "first_name": "Jane",
                              "last_name": "Doe",
                              "password": "test1234",
                              "token": "invalid-token" }
                  }',
          headers: headers
        )
      end
      expect(status).to eq(401) # Unauthorized

      post(
        '/web_api/v1/invites/by_token/:token/accept',
        params: '{ "user": { "email": "a@b.com",
                            "first_name": "Jane",
                            "last_name": "Doe",
                            "password": "test1234",
                            "token": "invalid-token" }
              }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/invites/by_token/:token/accept',
        params: '{ "user": { "email": "a@b.com",
                            "first_name": "Jane",
                            "last_name": "Doe",
                            "password": "test1234",
                            "token": "invalid-token" }
                }',
        headers: headers
      )
      expect(status).to eq(401) # Unauthorized
    end
  end

  # ==================================================================================================================
  # These tests are too slow to include in the CI, due to the number of requests they make, and are therefore skipped.
  # Remove skip statement to run in local dev environment, but do not push/merge that change to master.

  it 'limits login requests from same IP to 4000 in 1 day', skip: 'Too slow to include in CI' do
    headers = { 'CONTENT_TYPE' => 'application/json' }

    # Use a different email for each request, to avoid testing limit by email
    400.times do |i|
      # Move time forward, each 10 requests, to avoid testing shorter time-limited rule
      travel_to((i * 20).seconds.from_now) do
        10.times do |j|
          iter = (10 * i) + (j + 1)
          post(
            '/web_api/v1/user_token',
            params: '{ "auth": { "email": "INSERT", "password": "test123456" } }'.gsub('INSERT', "a#{iter}@b.com"),
            headers: headers
          )
          print "Target: 4000 requests. Requests made: #{iter}\r"
          $stdout.flush
        end
      end
    end
    expect(status).to eq(404) # Not found

    travel_to(134.minutes.from_now) do
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a11@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(27.hours.from_now) do
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "INSERT": "a12@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(404) # Not found
    end
  end

  it 'limits login requests for same email to 100 in 1 day', skip: 'Too slow to include in CI' do
    # Use a different IP for each request, to avoid testing limit by IP
    10.times do |i|
      # Move time forward, each 10 requests, to avoid testing shorter time-limited rule
      travel_to((i * 20).seconds.from_now) do
        10.times do |j|
          iter = (10 * i) + (j + 1)
          headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => "1.2.3.#{iter}" }
          post(
            '/web_api/v1/user_token',
            params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
            headers: headers
          )
          print "Target: 100 requests. Requests made: #{iter}\r"
          $stdout.flush
        end
      end
    end
    expect(status).to eq(404) # Not found

    travel_to(10.minutes.from_now) do
      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.101' }
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(25.hours.from_now) do
      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.102' }
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(404) # Not found
    end
  end

  it 'limits requests to 1000 in 3 minutes', skip: 'Too slow to include in CI' do
    freeze_time do
      1000.times do |i|
        get '/web_api/v1/projects'
        print "Target: 1000 requests. Requests made: #{i + 1}\r"
        $stdout.flush
      end
      expect(status).to eq(200)

      get '/web_api/v1/projects'
      expect(status).to eq(429)
    end

    travel_to(3.minutes.from_now) do
      get '/web_api/v1/projects'
      expect(status).to eq(200)
    end
  end
end
