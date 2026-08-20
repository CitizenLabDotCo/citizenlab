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

  # Rack::Attack counts in fixed windows (`Time.now.to_i / period`), not sliding
  # ones, so an example that spreads its requests over a window has to start at a
  # window boundary. Otherwise the counter silently resets partway through and the
  # request that should have been throttled isn't. 120 is the longest period any of
  # the throttles exercised this way uses, and every shorter one divides it.
  def freeze_at_window_start(&)
    travel_to(Time.zone.at(Time.now.to_i - (Time.now.to_i % 120)), &)
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

  # Both confirmation-code controllers. Every endpoint is throttled on the
  # identifier in the request body (email / phone / new_email / new_phone) and on
  # the authenticated user, each limited to 1 request per 5 seconds and 5 requests
  # per 2 minutes, plus a looser per-IP backstop of 5 requests per 20 seconds.
  #
  # These endpoints reject the requests below for their own reasons (unknown
  # account, sms feature off, blank param, ...), and those reasons differ per
  # endpoint. What every example asserts is only whether the request was throttled:
  # any status other than 429 means it reached the controller.
  describe 'confirmation code endpoints' do
    endpoints = [
      { path: '/web_api/v1/user/request_code_email', root: 'request_code', identifier: 'email' },
      { path: '/web_api/v1/user/request_code_new_email', root: 'request_code', identifier: 'new_email' },
      { path: '/web_api/v1/user/request_code_phone', root: 'request_code', identifier: 'phone' },
      { path: '/web_api/v1/user/request_code_new_phone', root: 'request_code', identifier: 'new_phone' },
      { path: '/web_api/v1/user/confirm_code_email', root: 'confirmation', identifier: 'email' },
      { path: '/web_api/v1/user/confirm_code_new_email', root: 'confirmation', identifier: nil },
      { path: '/web_api/v1/user/confirm_code_phone', root: 'confirmation', identifier: 'phone' },
      { path: '/web_api/v1/user/confirm_code_new_phone', root: 'confirmation', identifier: nil }
    ]

    # A body for `endpoint`, carrying the `index`th distinct identifier. Pass
    # `identifier: false` to leave the identifier out, which is what the callers
    # that fall back to current_user do.
    def code_params(endpoint, index = 0, identifier: true)
      body = endpoint[:root] == 'confirmation' ? { 'code' => '1234' } : {}

      if endpoint[:identifier] && identifier
        body[endpoint[:identifier]] =
          if endpoint[:identifier].include?('phone')
            "+1415555#{format('%04d', index)}"
          else
            "a#{index}@example.org"
          end
      end

      { endpoint[:root] => body }.to_json
    end

    endpoints.each do |endpoint|
      describe endpoint[:path] do
        it 'limits requests from the same IP to 5 in 20 seconds' do
          # A different identifier for each request, and no token, so that the IP is
          # the only key these requests share
          freeze_time do
            5.times do |i|
              post(endpoint[:path], params: code_params(endpoint, i), headers: json_headers)
              expect(status).not_to eq(429)
            end

            post(endpoint[:path], params: code_params(endpoint, 5), headers: json_headers)
            expect(status).to eq(429) # Too many requests
          end

          travel_to(20.seconds.from_now) do
            post(endpoint[:path], params: code_params(endpoint, 6), headers: json_headers)
            expect(status).not_to eq(429)
          end
        end

        if endpoint[:identifier]
          it "limits requests for the same #{endpoint[:identifier]} to 1 in 5 seconds" do
            params = code_params(endpoint)

            # A different IP for each request, to avoid testing the limit by IP
            freeze_at_window_start do
              post(endpoint[:path], params: params, headers: json_headers(ip: '1.2.3.1'))
              expect(status).not_to eq(429)

              post(endpoint[:path], params: params, headers: json_headers(ip: '1.2.3.2'))
              expect(status).to eq(429) # Too many requests

              travel 5.seconds
              post(endpoint[:path], params: params, headers: json_headers(ip: '1.2.3.3'))
              expect(status).not_to eq(429)
            end
          end

          it "limits requests for the same #{endpoint[:identifier]} to 5 in 2 minutes" do
            params = code_params(endpoint)

            freeze_at_window_start do
              5.times do |i|
                post(endpoint[:path], params: params, headers: json_headers(ip: "1.2.3.#{i + 1}"))
                expect(status).not_to eq(429)
                travel 6.seconds
              end

              post(endpoint[:path], params: params, headers: json_headers(ip: '1.2.3.6'))
              expect(status).to eq(429) # Too many requests

              travel 90.seconds # into the next 2 minute window
              post(endpoint[:path], params: params, headers: json_headers(ip: '1.2.3.7'))
              expect(status).not_to eq(429)
            end
          end

          it "ignores casing and spacing in the #{endpoint[:identifier]}" do
            identifier = JSON.parse(code_params(endpoint)).dig(endpoint[:root], endpoint[:identifier])
            spaced = code_params(endpoint).sub(identifier, identifier.upcase.chars.join(' '))

            freeze_at_window_start do
              post(endpoint[:path], params: code_params(endpoint), headers: json_headers(ip: '1.2.3.1'))
              expect(status).not_to eq(429)

              post(endpoint[:path], params: spaced, headers: json_headers(ip: '1.2.3.2'))
              expect(status).to eq(429) # Too many requests
            end
          end
        end

        it 'limits requests for the same user to 1 in 5 seconds' do
          # No identifier in the body and a different IP for each request, so that the
          # user from the JWT is the only key these requests share
          params = code_params(endpoint, identifier: false)

          freeze_at_window_start do
            post(endpoint[:path], params: params, headers: json_headers(token: token, ip: '1.2.3.1'))
            expect(status).not_to eq(429)

            post(endpoint[:path], params: params, headers: json_headers(token: token, ip: '1.2.3.2'))
            expect(status).to eq(429) # Too many requests

            travel 5.seconds
            post(endpoint[:path], params: params, headers: json_headers(token: token, ip: '1.2.3.3'))
            expect(status).not_to eq(429)
          end
        end

        it 'limits requests for the same user to 5 in 2 minutes' do
          params = code_params(endpoint, identifier: false)

          freeze_at_window_start do
            5.times do |i|
              post(endpoint[:path], params: params, headers: json_headers(token: token, ip: "1.2.3.#{i + 1}"))
              expect(status).not_to eq(429)
              travel 6.seconds
            end

            post(endpoint[:path], params: params, headers: json_headers(token: token, ip: '1.2.3.6'))
            expect(status).to eq(429) # Too many requests

            travel 90.seconds # into the next 2 minute window
            post(endpoint[:path], params: params, headers: json_headers(token: token, ip: '1.2.3.7'))
            expect(status).not_to eq(429)
          end
        end

        it 'does not throttle a different user, IP and identifier' do
          other_token = AuthToken::AuthToken.new(payload: create(:user).to_token_payload).token

          freeze_at_window_start do
            post(endpoint[:path], params: code_params(endpoint, 0), headers: json_headers(token: token, ip: '1.2.3.1'))
            expect(status).not_to eq(429)

            post(endpoint[:path], params: code_params(endpoint, 1), headers: json_headers(token: other_token, ip: '1.2.3.2'))
            expect(status).not_to eq(429)
          end
        end
      end
    end

    it 'counts a token passed as a query param against the same user' do
      # AuthToken reads params[:token] before the Authorization header, so a caller
      # can't escape the per-user limit by moving the token from one to the other.
      path = '/web_api/v1/user/request_code_email'
      params = '{ "request_code": { "only_if_first_time": false } }'

      freeze_at_window_start do
        post("#{path}?token=#{token}", params: params, headers: json_headers(ip: '1.2.3.1'))
        expect(status).to eq(200) # OK

        post(path, params: params, headers: json_headers(token: token, ip: '1.2.3.2'))
        expect(status).to eq(429) # Too many requests
      end
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
          '/web_api/v1/users/check_email',
          params: "{ \"user\": { \"email\": \"user#{i}@test.com\" } }",
          headers: json_headers
        )
      end
      expect(status).to eq(200) # ok

      post(
        '/web_api/v1/users/check_email',
        params: '{ "user": { "email": "user6@test.com" } }',
        headers: json_headers
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(2.minutes.from_now) do
      post(
        '/web_api/v1/users/check_email',
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
          '/web_api/v1/users/check_email',
          params: '{ "user": { "email": "user@test.com" } }',
          headers: json_headers(ip: "1.2.3.#{i}")
        )
      end
      expect(status).to eq(200) # ok

      post(
        '/web_api/v1/users/check_email',
        params: '{ "user": { "email": "user@test.com" } }',
        headers: json_headers(ip: '1.2.3.7')
      )
      expect(status).to eq(429) # Too many requests
    end

    travel_to(5.minutes.from_now) do
      post(
        '/web_api/v1/users/check_email',
        params: '{ "user": { "email": "user@test.com" } }',
        headers: json_headers(ip: '1.2.3.8')
      )
      expect(status).to eq(200) # ok
    end
  end

  # The phone counterparts of the throttles above. The endpoints below all reject
  # the request for their own reasons (unknown number, sms feature off, ...), which
  # is exactly what makes them useful here: any status other than 429 means the
  # request was not throttled.
  describe 'phone endpoints' do
    let(:headers) { { 'CONTENT_TYPE' => 'application/json' } }

    # A different valid number for each request, to avoid testing the limit by phone number
    def phone_login_params(index)
      %({ "auth": { "phone": "+141555526#{format('%02d', index)}", "password": "test123456" } })
    end

    it 'limits phone login requests from same IP to 10 in 20 seconds' do
      freeze_time do
        10.times { |i| post('/web_api/v1/user_token_phone', params: phone_login_params(i), headers: headers) }
        expect(status).to eq(404) # Not found

        post('/web_api/v1/user_token_phone', params: phone_login_params(10), headers: headers)
        expect(status).to eq(429) # Too many requests
      end

      travel_to(20.seconds.from_now) do
        post('/web_api/v1/user_token_phone', params: phone_login_params(11), headers: headers)
        expect(status).to eq(404) # Not found
      end
    end

    it 'limits phone login requests for same phone number to 10 in 20 seconds' do
      params = '{ "auth": { "phone": "+14155552671", "password": "test123456" } }'

      # Use a different IP for each request, to avoid testing the limit by IP
      freeze_time do
        10.times do |i|
          post('/web_api/v1/user_token_phone', params: params, headers: headers.merge('REMOTE_ADDR' => "1.2.3.#{i + 1}"))
        end
        expect(status).to eq(404) # Not found

        post('/web_api/v1/user_token_phone', params: params, headers: headers.merge('REMOTE_ADDR' => '1.2.3.11'))
        expect(status).to eq(429) # Too many requests
      end

      travel_to(20.seconds.from_now) do
        post('/web_api/v1/user_token_phone', params: params, headers: headers.merge('REMOTE_ADDR' => '1.2.3.12'))
        expect(status).to eq(404) # Not found
      end
    end

    context 'when the sms feature is enabled' do
      include_context 'with sms feature enabled'

      before { SettingsService.new.activate_feature!('sms_login') }

      # A different valid number for each request, to avoid testing the limit by phone number
      def check_phone_params(index)
        %({ "user": { "phone": "+141555526#{format('%02d', index)}" } })
      end

      it 'limits phone account creation requests from same IP to 10 in 20 seconds' do
        # An invalid number is rejected by the controller, so no account is created and no SMS is sent
        params = '{ "user": { "phone": "not-a-number", "locale": "en" } }'

        freeze_time do
          10.times { post('/web_api/v1/users/create_phone', params: params, headers: headers) }
          expect(status).to eq(422) # Unprocessable entity

          post('/web_api/v1/users/create_phone', params: params, headers: headers)
          expect(status).to eq(429) # Too many requests
        end

        travel_to(20.seconds.from_now) do
          post('/web_api/v1/users/create_phone', params: params, headers: headers)
          expect(status).to eq(422) # Unprocessable entity
        end
      end

      it 'limits phone check requests from same IP to 5 in 2 minutes' do
        freeze_time do
          5.times { |i| post('/web_api/v1/users/check_phone', params: check_phone_params(i), headers: headers) }
          expect(status).to eq(200) # ok

          post('/web_api/v1/users/check_phone', params: check_phone_params(5), headers: headers)
          expect(status).to eq(429) # Too many requests
        end

        travel_to(2.minutes.from_now) do
          post('/web_api/v1/users/check_phone', params: check_phone_params(6), headers: headers)
          expect(status).to eq(200) # ok
        end
      end

      it 'limits phone check requests to same phone number to 5 in 5 minutes' do
        params = '{ "user": { "phone": "+14155552671" } }'

        # Use a different IP for each request, to avoid testing the limit by IP
        freeze_time do
          5.times { |i| post('/web_api/v1/users/check_phone', params: params, headers: headers.merge('REMOTE_ADDR' => "1.2.3.#{i}")) }
          expect(status).to eq(200) # ok

          post('/web_api/v1/users/check_phone', params: params, headers: headers.merge('REMOTE_ADDR' => '1.2.3.7'))
          expect(status).to eq(429) # Too many requests
        end

        travel_to(5.minutes.from_now) do
          post('/web_api/v1/users/check_phone', params: params, headers: headers.merge('REMOTE_ADDR' => '1.2.3.8'))
          expect(status).to eq(200) # ok
        end
      end
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
