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
  end
end
