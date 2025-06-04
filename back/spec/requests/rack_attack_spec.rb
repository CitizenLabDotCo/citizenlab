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

  let!(:user) { create(:user) }

  it 'limits login requests from same IP to 2 in 20 seconds' do
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

  it 'does not block a whitelisted IP' do
    whitelisted_ip = '12.34.56.78'
    stub_const 'ENV', ENV.to_h.merge('RACK_ATTACK_SAFELIST_IP' => whitelisted_ip)
    load Rails.root.join('config/initializers/rack_attack.rb')

    freeze_time do
      50.times do
        post(
          '/web_api/v1/user_token',
          params: '{ "auth": { "INSERT": "a12@b.com", "password": "test123456" } }',
          headers: { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => whitelisted_ip }
        )
      end
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
      'minimum_length' => 5
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
    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.1' }
      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', user.email.to_s),
        headers: headers
      )
      expect(status).to eq(202) # Accepted

      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.2' }
      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', user.email.to_s),
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      headers = { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.3' }
      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', user.email.to_s),
        headers: headers
      )
      expect(status).to eq(202) # Accepted
    end
  end

  it 'limits search requests from same IP to 15 in 20 seconds' do
    freeze_time do
      15.times do
        get '/web_api/v1/admin_publications?search=something'
      end
      expect(status).to eq(200) # OK

      get '/web_api/v1/admin_publications?search=something'
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      get '/web_api/v1/admin_publications?search=something'
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

  it 'limits resend code requests from same IP to 10 in 5 minutes' do
    headers = { 'CONTENT_TYPE' => 'application/json' }

    freeze_time do
      10.times do
        post('/web_api/v1/user/resend_code', headers: headers)
      end
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/resend_code', headers: headers)
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.minutes.from_now) do
      post('/web_api/v1/user/resend_code', headers: headers)
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits confirmation requests from same IP to 5 in 20 seconds' do
    headers = { 'CONTENT_TYPE' => 'application/json' }

    freeze_time do
      5.times do
        post(
          '/web_api/v1/user/confirm',
          params: '{ "confirmation": { "code": "1234" } }',
          headers: headers
        )
      end
      expect(status).to eq(401) # Unauthorized

      post(
        '/web_api/v1/user/confirm',
        params: '{ "confirmation": { "code": "1234" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/user/confirm',
        params: '{ "confirmation": { "code": "1234" } }',
        headers: headers
      )
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits confirmation requests from same user to 10 in 24 hours' do
    # Use a different IP for each request, to avoid testing limit by IP
    token1 = AuthToken::AuthToken.new(payload: user.to_token_payload).token
    token2 = AuthToken::AuthToken.new(payload: create(:user).to_token_payload).token
    headers = { 'CONTENT_TYPE' => 'application/json', 'Authorization' => "Bearer #{token1}" }
    start_time = Time.zone.now.midnight # Avoid testing 24-hour period that spans midnight

    travel_to(start_time) do
      10.times do |i|
        headers['REMOTE_ADDR'] = "1.2.3.#{i + 1}"
        post(
          '/web_api/v1/user/confirm',
          params: '{ "confirmation": { "code": "12345" } }',
          headers: headers
        )
      end
      expect(status).to eq(422) # Unprocessable entity == given confirmation code is not correct

      headers['REMOTE_ADDR'] = '1.2.3.11'
      post(
        '/web_api/v1/user/confirm',
        params: '{ "confirmation": { "code": "12345" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests

      # Use a different user for the next request, to test throttling is only for the first user
      headers['Authorization'] = "Bearer #{token2}"
      headers['REMOTE_ADDR'] = '1.2.3.12'
      post(
        '/web_api/v1/user/confirm',
        params: '{ "confirmation": { "code": "12345" } }',
        headers: headers
      )
      expect(status).to eq(422) # Unprocessable entity == given confirmation code is not correct
    end

    headers['Authorization'] = "Bearer #{token1}"
    travel_to(start_time + 23.hours) do
      headers['REMOTE_ADDR'] = '1.2.3.13'
      post(
        '/web_api/v1/user/confirm',
        params: '{ "confirmation": { "code": "12345" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(start_time + 25.hours) do
      headers['REMOTE_ADDR'] = '1.2.3.13'
      post(
        '/web_api/v1/user/confirm',
        params: '{ "confirmation": { "code": "12345" } }',
        headers: headers
      )
      expect(status).to eq(422) # Unprocessable entity == given confirmation code is not correct
    end
  end

  # ==================================================================================================================
  # These tests are too slow to include in the CI, due to the number of requests they make, and are therefore skipped.
  # Remove skip statement to run in local dev environment, but do not push/merge that change to master.

  it 'limits login requests from same IP to 4000 in 1 day', skip: 'Too slow to include in CI' do
    headers = { 'CONTENT_TYPE' => 'application/json' }
    start_time = Time.zone.now.midnight

    # Use a different email for each request, to avoid testing limit by email
    400.times do |i|
      # Move time forward, each 10 requests, to avoid testing shorter time-limited rule
      travel_to(start_time + (i * 20).seconds) do
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

    travel_to(start_time + 8000.seconds) do # 400 * 20 seconds
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a11@b.com", "password": "test123456" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(start_time + 25.hours) do
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

    travel_to(200.seconds.from_now) do # 10 * 20 seconds
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

  it 'limits authoring assistance response requests from same IP to 10 in 20 seconds' do
    token = AuthToken::AuthToken.new(payload: create(:user).to_token_payload).token
    headers = {
      'CONTENT_TYPE' => 'application/json',
      'Authorization' => "Bearer #{token}"
    }

    freeze_time do
      10.times do
        post(
          "/web_api/v1/ideas/#{SecureRandom.uuid}/authoring_assistance_responses",
          params: '{ "authoring_assistance_response": { "custom_free_prompt": "Is this a good idea?" } }',
          headers: headers
        )
      end
      expect(status).to eq(401) # Not found

      post(
        "/web_api/v1/ideas/#{SecureRandom.uuid}/authoring_assistance_responses",
        params: '{ "authoring_assistance_response": { "custom_free_prompt": "Is this a good idea?" } }',
        headers: headers
      )
      expect(status).to eq(429) # Too many requests
    end
  end

  it 'limits similar inputs requests from same IP to 5 in 1 second' do
    token = AuthToken::AuthToken.new(payload: create(:user).to_token_payload).token
    headers = {
      'CONTENT_TYPE' => 'application/json',
      'Authorization' => "Bearer #{token}"
    }

    allow_any_instance_of(CohereMultilingualEmbeddings).to receive(:embedding) do
      create(:embeddings_similarity).embedding
    end
    SettingsService.new.activate_feature! 'input_iq'

    project_id = create(:project_with_active_ideation_phase).id
    params_proc = proc do |title|
      {
        idea: {
          project_id: project_id,
          title_multiloc: {
            'en' => title
          }
        }
      }.to_json
    end
    freeze_time do
      5.times do |i|
        post(
          '/web_api/v1/ideas/similar_ideas',
          params: params_proc.call("Title #{i}"),
          headers: headers
        )
      end
      expect(status).to eq 200 # OK

      post(
        '/web_api/v1/ideas/similar_ideas',
        params: params_proc.call('Final idea'),
        headers: headers
      )
      expect(status).to eq 429 # Too many requests
    end
  end
end
