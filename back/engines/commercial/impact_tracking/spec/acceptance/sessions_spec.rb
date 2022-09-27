# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Impact tracking session' do
  explanation 'Signals the start of a browsing session, corresponds with the loading of the platform'

  before do
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/sessions' do
    example 'Track the start of a session of an unauthenticated user' do
      do_request
      expect(response_status).to eq 201
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        monthly_user_hash: be_present,
        created_at: be_present,
        highest_role: nil
      })
    end

    example 'Track the start of a session of a normal user' do
      user_header_token
      do_request
      expect(response_status).to eq 201
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        highest_role: 'user'
      })
    end

    example 'Don\'t track the session start of a crawler', document: false do
      header 'User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      do_request
      expect(ImpactTracking::Session.count).to eq 0
    end

    example 'Don\'t track the session start of prerender', document: false do
      header 'User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/W.X.Y.Z Safari/537.36 Prerender (+https://github.com/prerender/prerender)'
      do_request
      expect(ImpactTracking::Session.count).to eq 0
    end

    example 'Track the session start of an admin', document: false do
      admin_header_token
      do_request
      expect(response_status).to eq 201
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        highest_role: 'admin'
      })
    end

    example 'Track the session start of a super_admin', document: false do
      header_token_for(create(:super_admin))
      do_request
      expect(response_status).to eq 201
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        highest_role: 'super_admin'
      })
    end
  end
end
