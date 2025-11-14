# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User', admin_api: true do
  before do
    header 'Content-Type', 'application/json'
    header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')
  end

  let!(:user) { create(:user, email: 'moderator@govocal.com') }

  get 'admin_api/users' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of users per page'
    end

    before do
      create_list(:user, 5)
    end

    example_request 'Get all users' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq 6
      expect(json_response.pluck(:email)).to match_array User.all.pluck(:email)
    end

    example 'Get users on first page' do
      do_request(page: { number: 1, size: 3 })
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq 3
    end
  end

  get 'admin_api/users/by_email' do
    parameter :email, 'The email of the user'

    let(:email) { 'moderator@govocal.com' }

    example_request 'Get one user by email' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:email]).to eq 'moderator@govocal.com'
    end
  end

  get 'admin_api/users/:id/jwt_token' do
    let(:id) { user.id }

    example 'Get JWT token for a user' do
      freeze_time = Time.zone.parse('2023-01-01 12:00:00')
      travel_to(freeze_time) do
        do_request
      end

      expect(status).to eq 200
      jwt_token = json_parse(response_body)[:jwt_token]

      # Test JWT structure (payloads starting with "{" will always start with "eyJ" when encoded)
      expect(jwt_token).to match(/\AeyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\z/)

      # Test the decoded payload
      payload, header = JWT.decode(jwt_token, nil, false)
      expect(header['alg']).to be_present
      expect(payload).to include(
        'sub' => id,
        'exp' => (freeze_time + 30.minutes).to_i
      )
    end
  end

  delete 'admin_api/users/bulk_delete_by_emails', active_job_inline_adapter: true do
    parameter :emails, 'Array of user emails'

    let(:emails) { [user.email, 'not-existing-email@example.com'] }

    before do
      expect(DeleteUserJob).to receive(:perform_later).with(user).once
      expect(Sentry).to receive(:capture_message).once
    end

    example_request 'Delete users by emails' do
      expect(status).to eq 200
    end
  end

  get 'admin_api/users/:id' do
    let(:id) { user.id }

    example_request 'Get one user by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:id]).to eq user.id
    end
  end

  post 'admin_api/users' do
    with_options scope: :user do
      parameter :first_name, 'The first name', required: true
      parameter :last_name, 'The last name', required: true
      parameter :email, 'The email', required: true
      parameter :password, 'The password', required: true
      parameter :roles, 'The roles of the user'
      parameter :remote_avatar_url, 'The user avatar'
    end
    parameter :confirm_email, 'Should the email already be verified?', required: false, default: false

    ValidationErrorHelper.new.error_fields(self, User)

    let(:first_name) { 'Jaak' }
    let(:last_name) { 'Brijl' }
    let(:email) { 'admin@govocal.com' }
    let(:password) { 'nmQuiteP4s' }
    let(:roles) { [{ type: 'admin' }] }

    describe do
      example_request 'Create a user' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response[:last_name]).to eq 'Brijl'
        expect(User.find_by(email: email).email_confirmed_at).to be_blank
      end
    end

    describe do
      before do
        configuration = AppConfiguration.instance
        configuration.settings['user_confirmation'] = {
          allowed: true,
          enabled: true
        }
        configuration.save!
      end

      let(:confirm_email) { true }

      example_request 'Create a user with a confirmed email' do
        expect(response_status).to eq 201
        user = User.find_by(email: email)

        expect(user.email_confirmed_at).to be_present
        expect(user.confirmation_required?).to be false
      end
    end
  end

  patch 'admin_api/users/:id' do
    with_options scope: :user do
      parameter :first_name, 'The first name'
      parameter :last_name, 'The last name'
      parameter :email, 'The email'
      parameter :password, 'The password'
      parameter :roles, 'The roles of the user'
      parameter :remote_avatar_url, 'The user avatar'
      parameter :custom_field_values, 'All custom field values, if given overwrites the existing values'
    end
    parameter :confirm_email, 'Should the email already be verified?', required: false, default: false

    ValidationErrorHelper.new.error_fields(self, User)

    let(:id) { user.id }
    let(:first_name) { 'Jacqueline' }
    let(:roles) { [{ type: 'admin' }] }
    let!(:cf) { create(:custom_field, key: 'favourite_drink') }
    let(:custom_field_values) { { favourite_drink: 'wine' } }

    describe do
      example_request 'Update a user' do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response[:first_name]).to eq 'Jacqueline'
        expect(json_response[:custom_field_values]).to eq({ favourite_drink: 'wine' })
      end
    end

    describe do
      before do
        SettingsService.new.activate_feature!('user_confirmation')
      end

      let(:confirm_email) { true }
      let(:password) { 'new-password' }
      let(:roles) { [{ type: 'admin' }] }

      example 'Update a user and confirm email' do
        expect { do_request }.to change { user.reload.password_digest }

        expect(status).to be 200

        user.reload
        expect(user.email_confirmed_at).to be_present
        expect(user.confirmation_required?).to be false
        expect(user.roles).to eq [{ 'type' => 'admin' }]
      end
    end
  end
end
