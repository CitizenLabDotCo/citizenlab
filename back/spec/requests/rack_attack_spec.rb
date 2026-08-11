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
  let(:token) { AuthToken::AuthToken.new(payload: user.to_token_payload).token }

  # Throttles key off the IP and the JWT, so examples vary one and hold the other fixed.
  def json_headers(token: nil, ip: nil)
    headers = { 'CONTENT_TYPE' => 'application/json' }
    headers['Authorization'] = "Bearer #{token}" if token
    headers['REMOTE_ADDR'] = ip if ip
    headers
  end

  it 'limits login requests from same IP to 2 in 20 seconds' do
    # Use a different email for each request, to avoid testing limit by email
    freeze_time do
      10.times do |i|
        post(
          '/web_api/v1/user_token',
          params: '{ "auth": { "email": "INSERT", "password": "test123456" } }'.gsub('INSERT', "a#{i}@b.com"),
          headers: json_headers
        )
      end
      expect(status).to eq(404) # Not found

      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a11@b.com", "password": "test123456" } }',
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "INSERT": "a12@b.com", "password": "test123456" } }',
        headers: json_headers
      )
      expect(status).to eq(404) # Not found
    end
  end

  it 'limits login requests for same email to 10 in 20 seconds' do
    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      10.times do |i|
        post(
          '/web_api/v1/user_token',
          params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
          headers: json_headers(ip: "1.2.3.#{i + 1}")
        )
      end
      expect(status).to eq(404) # Not found

      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: json_headers(ip: '1.2.3.11')
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: json_headers(ip: '1.2.3.12')
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
          headers: json_headers(ip: whitelisted_ip)
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
      'minimum_length' => 5
    }
    AppConfiguration.instance.update! settings: settings

    # Use a different email for each request, to emulate multiple account creation attempts
    freeze_time do
      10.times do |i|
        post(
          '/web_api/v1/users',
          params: '{ "user": { "email": "INSERT", "locale": "en" }}'.gsub('INSERT', "a#{i + 1}@b.com"),
          headers: json_headers
        )
      end
      expect(status).to eq(201) # Created

      post(
        '/web_api/v1/users',
        params: '{ "user": { "email": "a11@b.com", "locale": "en" }}',
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/users',
        params: '{ "user": { "email": "a12@b.com", "locale": "en" }}',
        headers: json_headers
      expect(status).to eq(201) # Created
    end
  end

  it 'limits password reset requests from same IP to 10 in 20 seconds' do
    freeze_time do
      10.times do
        post(
          '/web_api/v1/users/reset_password',
          params: '{ "user": { "password": "new_password", "token": "invalid-token" } }',
          headers: json_headers
        )
      end
      expect(status).to eq(401) # Unauthorized

      post(
        '/web_api/v1/users/reset_password',
        params: '{ "user": { "password": "new_password", "token": "invalid-token" } }',
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/users/reset_password',
        params: '{ "user": { "password": "new_password", "token": "invalid-token" } }',
        headers: json_headers
      )
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits password reset email requests from same IP to 10 in 20 seconds' do
    users = create_list(:user, 12)

    # Use a different email for each request, to avoid testing limit by email
    freeze_time do
      10.times do |i|
        post(
          '/web_api/v1/users/reset_password_email',
          params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[i].email.to_s),
          headers: json_headers
        )
      end
      expect(status).to eq(202) # Accepted

      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[10].email.to_s),
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', users[11].email.to_s),
        headers: json_headers
      expect(status).to eq(202) # Accepted
    end
  end

  it 'limits password reset email requests for same email to 1 in 20 seconds' do
    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', user.email.to_s),
        headers: json_headers(ip: '1.2.3.1')
      )
      expect(status).to eq(202) # Accepted

      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', user.email.to_s),
        headers: json_headers(ip: '1.2.3.2')
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/users/reset_password_email',
        params: '{ "user": { "email": "INSERT" } }'.gsub('INSERT', user.email.to_s),
        headers: json_headers(ip: '1.2.3.3')
      )
      expect(status).to eq(202) # Accepted
    end
  end

  it 'limits search requests from same IP to 15 in 20 seconds' do
    freeze_time do
      15.times do
        get '/web_api/v1/ideas?search=some-random-search-term'
      end
      expect(status).to eq(200) # OK

      get '/web_api/v1/ideas?search=some-random-search-term'
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      get '/web_api/v1/ideas?search=some-random-search-term'
      expect(status).to eq(200) # OK
    end
  end

  it 'limits invite acceptance requests from same IP to 10 in 20 seconds' do
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
          headers: json_headers
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
        headers: json_headers
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
        headers: json_headers
      )
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits unauthenticated code requests from same IP to 10 in 5 minutes' do
    # Use a different email for each request, to avoid testing limit by email
    freeze_time do
      10.times do |i|
        post('/web_api/v1/user/request_code_email', params: '{ "request_code": { "email": "INSERT" } }'.gsub('INSERT', "a#{i}@b.com"), headers: json_headers)
      end
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/request_code_email', params: '{ "request_code": { "email": "a11@b.com" } }', headers: json_headers)
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.minutes.from_now) do
      post('/web_api/v1/user/request_code_email', params: '{ "request_code": { "email": "a12@b.com" } }', headers: json_headers)
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits code requests for same email to 1 in 5 seconds' do
    params = '{ "request_code": { "email": "coolemail@example.org" } }'

    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      post('/web_api/v1/user/request_code_email', params: params, headers: json_headers(ip: '1.2.3.1'))
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/request_code_email', params: params, headers: json_headers(ip: '1.2.3.2'))
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_email', params: params, headers: json_headers(ip: '1.2.3.3'))
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits code requests for same user to 1 in 5 seconds' do
    # No email in the body, to avoid testing limit by email
    params = '{ "request_code": { "only_if_first_time": false } }'

    freeze_time do
      post('/web_api/v1/user/request_code_email', params: params, headers: json_headers(token: token))
      expect(status).to eq(200) # OK

      post('/web_api/v1/user/request_code_email', params: params, headers: json_headers(token: token))
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_email', params: params, headers: json_headers(token: token))
      expect(status).to eq(200) # OK
    end
  end

  it 'limits code requests for same user when the token is passed as a query param' do
    # AuthToken reads params[:token] before the Authorization header
    params = '{ "request_code": { "only_if_first_time": false } }'

    freeze_time do
      post("/web_api/v1/user/request_code_email?token=#{token}", params: params, headers: json_headers)
      expect(status).to eq(200) # OK

      post("/web_api/v1/user/request_code_email?token=#{token}", params: params, headers: json_headers)
      expect(status).to eq(429) # Too many requests
    end
  end

  it 'limits email change code requests from same IP to 1 in 5 seconds' do
    freeze_time do
      post('/web_api/v1/user/request_code_new_email', params: '{ "request_code": { "new_email": "coolemail@example.org" } }', headers: json_headers)
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/request_code_new_email', params: '{ "request_code": { "new_email": "coolemail@example.org" } }', headers: json_headers)
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_new_email', params: '{ "request_code": { "new_email": "coolemail@example.org" } }', headers: json_headers)
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits email change code requests for same user to 1 in 5 seconds' do
    other_user = create(:user)
    params = "{ \"request_code\": { \"new_email\": \"#{other_user.email}\" } }"

    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      post('/web_api/v1/user/request_code_new_email', params: params, headers: json_headers(token: token, ip: '1.2.3.1'))
      expect(status).to eq(422) # Unprocessable entity

      post('/web_api/v1/user/request_code_new_email', params: params, headers: json_headers(token: token, ip: '1.2.3.2'))
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_new_email', params: params, headers: json_headers(token: token, ip: '1.2.3.3'))
      expect(status).to eq(422) # Unprocessable entity
    end
  end

  it 'limits phone re-confirmation code requests from same IP to 1 in 5 seconds' do
    freeze_time do
      post('/web_api/v1/user/request_code_phone', params: '{ "request_code": {} }', headers: json_headers)
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/request_code_phone', params: '{ "request_code": {} }', headers: json_headers)
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_phone', params: '{ "request_code": {} }', headers: json_headers)
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits phone re-confirmation code requests for same user to 1 in 5 seconds' do
    params = '{ "request_code": {} }'

    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      post('/web_api/v1/user/request_code_phone', params: params, headers: json_headers(token: token, ip: '1.2.3.1'))
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/request_code_phone', params: params, headers: json_headers(token: token, ip: '1.2.3.2'))
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_phone', params: params, headers: json_headers(token: token, ip: '1.2.3.3'))
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits phone change code requests from same IP to 1 in 5 seconds' do
    freeze_time do
      post('/web_api/v1/user/request_code_new_phone', params: '{ "request_code": { "new_phone": "+32470123456" } }', headers: json_headers)
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/request_code_new_phone', params: '{ "request_code": { "new_phone": "+32470123456" } }', headers: json_headers)
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_new_phone', params: '{ "request_code": { "new_phone": "+32470123456" } }', headers: json_headers)
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits phone change code requests for same user to 1 in 5 seconds' do
    params = '{ "request_code": { "new_phone": "+32470123456" } }'

    # Use a different IP for each request, to avoid testing limit by IP
    freeze_time do
      post('/web_api/v1/user/request_code_new_phone', params: params, headers: json_headers(token: token, ip: '1.2.3.1'))
      expect(status).to eq(401) # Unauthorized

      post('/web_api/v1/user/request_code_new_phone', params: params, headers: json_headers(token: token, ip: '1.2.3.2'))
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.seconds.from_now) do
      post('/web_api/v1/user/request_code_new_phone', params: params, headers: json_headers(token: token, ip: '1.2.3.3'))
      expect(status).to eq(401) # Unauthorized
    end
  end

  it 'limits unauthenticated confirmation requests from same IP to 5 in 20 seconds' do
    freeze_time do
      5.times do
        post(
          '/web_api/v1/user/confirm_code_email',
          params: "{ \"confirmation\": { \"email\": \"#{user.email}\", \"code\": \"1234\" } }",
          headers: json_headers
        )
      end
      expect(status).to eq(422)

      post(
        '/web_api/v1/user/confirm_code_email',
        params: "{ \"confirmation\": { \"email\": \"#{user.email}\", \"code\": \"1234\" } }",
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(20.seconds.from_now) do
      post(
        '/web_api/v1/user/confirm_code_email',
        params: "{ \"confirmation\": { \"email\": \"#{user.email}\", \"code\": \"1234\" } }",
        headers: json_headers
      )
      expect(status).to eq(422)
    end
  end

  # ==================================================================================================================
  # These tests are too slow to include in the CI, due to the number of requests they make, and are therefore skipped.
  # Remove skip statement to run in local dev environment, but do not push/merge that change to master.

  it 'limits login requests from same IP to 4000 in 1 day', skip: 'Too slow to include in CI' do
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
            headers: json_headers
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
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(start_time + 25.hours) do
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "INSERT": "a12@b.com", "password": "test123456" } }',
        headers: json_headers
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
          post(
            '/web_api/v1/user_token',
            params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
            headers: json_headers(ip: "1.2.3.#{iter}")
          )
          print "Target: 100 requests. Requests made: #{iter}\r"
          $stdout.flush
        end
      end
    end
    expect(status).to eq(404) # Not found

    travel_to(200.seconds.from_now) do # 10 * 20 seconds
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: json_headers(ip: '1.2.3.101')
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(25.hours.from_now) do
      post(
        '/web_api/v1/user_token',
        params: '{ "auth": { "email": "a@b.com", "password": "test123456" } }',
        headers: json_headers(ip: '1.2.3.102')
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

    freeze_time do
      10.times do
        post(
          "/web_api/v1/ideas/#{SecureRandom.uuid}/authoring_assistance_responses",
          params: '{ "authoring_assistance_response": { "custom_free_prompt": "Is this a good idea?" } }',
          headers: json_headers(token: token)
        )
      end
      expect(status).to eq(401) # Not found

      post(
        "/web_api/v1/ideas/#{SecureRandom.uuid}/authoring_assistance_responses",
        params: '{ "authoring_assistance_response": { "custom_free_prompt": "Is this a good idea?" } }',
        headers: json_headers(token: token)
      )
      expect(status).to eq(429) # Too many requests
    end
  end

  it 'limits similar inputs requests from same IP to 5 in 1 second' do
    token = AuthToken::AuthToken.new(payload: create(:user).to_token_payload).token

    allow_any_instance_of(CohereMultilingualEmbeddings).to receive(:embedding) do
      create(:embeddings_similarity).embedding
    end
    SettingsService.new.activate_feature! 'input_iq'

    phase_id = create(:project_with_active_ideation_phase).phases.first.id
    params_proc = proc do |title|
      {
        idea: {
          title_multiloc: {
            'en' => title
          }
        }
      }.to_json
    end
    freeze_time do
      5.times do |i|
        post(
          "/web_api/v1/phases/#{phase_id}/inputs/similar",
          params: params_proc.call("Title #{i}"),
          headers: json_headers(token: token)
        )
      end
      expect(status).to eq 200 # OK

      post(
        "/web_api/v1/phases/#{phase_id}/inputs/similar",
        params: params_proc.call('Final idea'),
        headers: json_headers(token: token)
      )
      expect(status).to eq 429 # Too many requests
    end
  end

  it 'limits user check requests from same IP to 5 in 20 seconds' do
    freeze_time do
      5.times do |i|
        post(
          '/web_api/v1/users/check',
          params: "{ \"user\": { \"email\": \"user#{i}@test.com\" } }",
          headers: json_headers
        )
      end
      expect(status).to eq(200) # ok

      post(
        '/web_api/v1/users/check',
        params: '{ "user": { "email": "user6@test.com" } }',
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(2.minutes.from_now) do
      post(
        '/web_api/v1/users/check',
        params: '{ "user": { "email": "user7@test.com" } }',
        headers: json_headers
      )
      expect(status).to eq(200) # ok
    end
  end

  it 'limits user check requests to same email to 5 in 5 minutes' do
    freeze_time do
      5.times do |i|
        post(
          '/web_api/v1/users/check',
          params: '{ "user": { "email": "user@test.com" } }',
          headers: json_headers(ip: "1.2.3.#{i}")
        )
      end
      expect(status).to eq(200) # ok

      post(
        '/web_api/v1/users/check',
        params: '{ "user": { "email": "user@test.com" } }',
        headers: json_headers(ip: '1.2.3.7')
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.minutes.from_now) do
      post(
        '/web_api/v1/users/check',
        params: '{ "user": { "email": "user@test.com" } }',
        headers: json_headers(ip: '1.2.3.8')
      )
      expect(status).to eq(200) # ok
    end
  end

  describe 'spam reports' do
    let(:headers) { { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.4' } }
    let(:params) { '{ "spam_report": { "reason_code": "other", "other_reason": "spam" } }' }

    def report_spam(path)
      post(path, params: params, headers: headers)
    end

    it 'limits spam reports on ideas from same IP to 10 in a minute' do
      path = "/web_api/v1/ideas/#{SecureRandom.uuid}/spam_reports"

      freeze_time do
        10.times { report_spam(path) }
        expect(status).to eq(401) # Unauthorized, but not throttled

        report_spam(path)
        expect(status).to eq(429) # Too many requests
      end

      travel_to(1.minute.from_now) do
        report_spam(path)
        expect(status).to eq(401) # Unauthorized
      end
    end

    it 'counts spam reports on comments against the same limit' do
      idea_path = "/web_api/v1/ideas/#{SecureRandom.uuid}/spam_reports"
      comment_path = "/web_api/v1/comments/#{SecureRandom.uuid}/spam_reports"

      freeze_time do
        10.times { report_spam(idea_path) }
        expect(status).to eq(401) # Unauthorized, but not throttled

        report_spam(comment_path)
        expect(status).to eq(429) # Too many requests
      end
    end
  end
end
