# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'StaticPages', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature! 'aggressive_caching'
  end

  get 'web_api/v1/static_pages' do
    example 'Caches for a visitor' do
      cache_key = 'api_response/example.org/web_api/v1/static_pages.json'

      expect(Rails.cache.read(cache_key)).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read(cache_key)).to be_present
    end

    # A project's page can be visible to this user and not to the next one.
    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'it does not cache' do
        cache_key = 'api_response/example.org/web_api/v1/static_pages.json'

        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
      end
    end
  end

  # by_slug, unlike show, checks the policy inside the action, so a cached copy would be
  # served before that check runs.
  get 'web_api/v1/static_pages/by_slug/:slug' do
    let(:group_member) { create(:user) }
    let(:page) { create(:static_page, project: create(:private_groups_project, user: group_member)) }
    let(:slug) { page.slug }
    let(:cache_key) { "api_response/example.org/web_api/v1/static_pages/by_slug/#{slug}.json" }

    example 'refuses a visitor when the page\'s project is hidden from them' do
      do_request
      expect(status).to eq 401
    end

    context 'when logged in as a user who can see the project' do
      before { header_token_for group_member }

      example 'it does not cache, so a visitor asking next is still refused' do
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil

        # Sign out: drop the auth cookie the request sent and any the response set.
        header 'Cookie', nil
        sign_out_client
        do_request
        expect(status).to eq 401
      end
    end
  end
end
