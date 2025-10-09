# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Verifications' do
  before do
    set_api_content_type
    @user = create(:user)
    header_token_for @user

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{ name: 'bogus' }]
    }
    create(:custom_field, key: 'gender')
    configuration.save!
  end

  post 'web_api/v1/verification_methods/bogus/verification' do
    with_options scope: :verification do
      parameter :desired_error, "Let's you fake errors. Pick your flavour: no_match, not_entitled, taken. Leave empty for success.", required: false
    end

    describe do
      let(:desired_error) { nil }

      example_request 'Fake verify with bogus' do
        assert_status 201
        expect(@user.reload.verified).to be true
        expect(@user.last_name).to eq 'BOGUS'
        expect(@user.custom_field_values['gender']).to eq 'female'
      end
    end

    describe do
      before { @user.update! registration_completed_at: nil }

      let(:desired_error) { nil }

      example_request "Fake verify with bogus for a user that didn't complete her registation yet" do
        assert_status 201
        expect(@user.reload.verified).to be true
        expect(@user.last_name).to eq 'BOGUS'
        expect(@user.custom_field_values['gender']).to eq 'female'
      end
    end

    describe do
      let(:desired_error) { 'no_match' }

      example_request '[error] Fake verify with bogus without a match' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:base, 'no_match')
      end
    end

    describe do
      let(:desired_error) { 'not_entitled' }

      example_request "[error] Fake verify with bogus with a match that's not entitled to verification" do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:base, 'not_entitled')
      end
    end

    describe do
      let(:desired_error) { 'any_none_suported_value' }

      example_request '[error] Fake verify with bogus using invalid desired_error' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:desired_error, 'invalid')
      end
    end

    describe do
      before do
        other_user = create(:user)
        Verification::VerificationService.new.verify_sync(
          user: other_user,
          method_name: 'bogus',
          verification_parameters: { desired_error: 'taken' }
        )
      end

      let(:desired_error) { 'taken' }

      example_request '[error] Fake verify with bogus using credentials that are already taken (2nd call)' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:base, 'taken')
      end
    end
  end
end
