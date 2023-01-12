# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Onboarding campaigns' do
  explanation 'Indicates which call to action to show to the current user'

  before do
    @user = create(:user, verified: true)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/onboarding_campaigns/current' do
    response_field :name, "One of #{Onboarding::OnboardingService.campaigns.join(' or ')}", scope: :attributes

    context 'for a user with a complete profile' do
      before do
        @user.update!(bio_multiloc: { en: 'I love scrabble' })
        AppConfiguration.instance.tap do |cfg|
          cfg.settings['core']['custom_onboarding_message'] = { en: 'Dance like noone is watching' }
          cfg.settings['core']['custom_onboarding_button'] = { en: 'Click here' }
          cfg.settings['core']['custom_onboarding_link'] = '/ideas'
        end.save
      end
    end

    context 'for a not signed-in user' do
      before do
        header 'Authorization', nil
      end

      example_request '[error] returns 401 Unauthorized response' do
        assert_status 401
      end
    end
  end
end
