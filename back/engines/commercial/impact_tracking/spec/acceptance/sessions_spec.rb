# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Impact tracking session' do
  explanation 'Signals the start of a browsing session, corresponds with the loading of the platform'

  before do
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/sessions' do
    with_options scope: :session do
      parameter :referrer, 'The referrer URL of the user'
      parameter :device_type, 'The device type of the user'
      parameter :browser_name, 'The browser name of the user'
      parameter :browser_version, 'The browser version of the user'
      parameter :os_name, 'The OS name of the user'
      parameter :os_version, 'The OS version of the user'
      parameter :entry_path, 'The path where the user entered'
    end

    let(:referrer) { 'https://www.google.com' }
    let(:device_type) { 'desktop' }
    let(:entry_path) { '/en/' }

    example 'Track the start of a session of an unauthenticated user' do
      do_request
      expect(response_status).to eq 200
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        monthly_user_hash: be_present,
        created_at: be_present,
        highest_role: nil,
        referrer: referrer,
        device_type: device_type
      })
      expect(ImpactTracking::Pageview.count).to eq 1
      expect(ImpactTracking::Pageview.first).to have_attributes({
        path: '/en/'
      })
    end

    example 'Track the start of a session of a resident' do
      resident = create(:user)
      header_token_for(resident)
      do_request
      expect(response_status).to eq 200
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        highest_role: 'user',
        user_id: resident.id
      })
    end

    example 'Creating a session also updates user last_active_at', document: false do
      last_active_at = 2.days.ago
      user = create(:user, last_active_at: last_active_at)
      header_token_for(user)
      do_request
      expect(user.reload.last_active_at.to_i).to be > last_active_at.to_i
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
      user = create(:admin)
      header_token_for(user)
      do_request
      expect(response_status).to eq 200
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        highest_role: 'admin',
        user_id: user.id
      })
    end

    example 'Track the session start of a super_admin', document: false do
      user = create(:super_admin)
      header_token_for(user)
      do_request
      expect(response_status).to eq 200
      expect(ImpactTracking::Session.count).to eq 1
      expect(ImpactTracking::Session.first).to have_attributes({
        highest_role: 'super_admin',
        user_id: user.id
      })
    end
  end

  patch 'web_api/v1/sessions/current/upgrade' do
    before do
      @ip = '59.152.62.114'
      @user_agent = 'User-Agent'
      @visitor_hash = ImpactTracking::SessionHashService.new.generate_for_visitor(@ip, @user_agent)
      session = create(:session, monthly_user_hash: @visitor_hash)
      @created_at = session.created_at
    end

    example 'Upgrade the current session from a visitor to a resident' do
      header 'User-Agent', @user_agent
      header 'X-Forwarded-For', @ip
      user = create(:user)
      header_token_for(user)

      do_request

      expect(response_status).to eq 202
      expect(ImpactTracking::Session.count).to eq 1
      session = ImpactTracking::Session.first
      expect(session.highest_role).to eq('user')
      expect(session.monthly_user_hash).not_to eq(@visitor_hash)
      expect(session.updated_at).not_to eq(@created_at)
      expect(session.user_id).to eq(user.id)
    end

    example 'Upgrading a session also updates user last_active_at', document: false do
      header 'User-Agent', @user_agent
      header 'X-Forwarded-For', @ip
      last_active_at = 2.days.ago
      user = create(:user, last_active_at: last_active_at)
      header_token_for(user)
      do_request
      expect(user.reload.last_active_at.to_i).to be > last_active_at.to_i
    end

    example 'Returns unauthorized when the user is not signed in', document: false do
      header 'User-Agent', @user_agent
      header 'X-Forwarded-For', @ip

      do_request

      expect(response_status).to eq 401
    end
  end

  post 'web_api/v1/sessions/:id/track_pageview' do
    with_options scope: :pageview do
      parameter :id, 'The id of the session'
      parameter :page_path, 'The path of the pageview'
    end

    let(:id) do
      session = create(:session)
      create(:pageview, session_id: session.id, path: '/en/')
      session.id
    end

    let(:page_path) { '/en/projects/my_project' }

    example 'Track a pageview when a session already exists' do
      do_request
      expect(response_status).to eq 201
      expect(ImpactTracking::Pageview.count).to eq 2
      expect(ImpactTracking::Pageview.order(created_at: :asc).last).to have_attributes({
        path: '/en/projects/my_project'
      })
    end

    example 'Reject a pageview when a session does not exists' do
      do_request(id: 'fake-id')
      expect(response_status).to eq 404
      expect(ImpactTracking::Pageview.count).to eq 1
      expect(ImpactTracking::Pageview.last).to have_attributes({
        path: '/en/'
      })
    end
  end
end
