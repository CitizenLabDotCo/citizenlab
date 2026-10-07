# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayouts', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    header 'Accept', 'application/json'
    SettingsService.new.activate_feature! 'aggressive_caching'
  end

  get 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code' do
    let(:page) { create(:static_page) }
    let(:static_page_id) { page.id }
    let(:code) { 'custom_page' }
    let(:cache_key) { "api_response/example.org/web_api/v1/static_pages/#{static_page_id}/content_builder_layouts/#{code}.json" }

    before { create(:layout, content_buildable: page, code: code) }

    example 'caches for a visitor' do
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read(cache_key)).to be_present
    end

    # A project's page can be visible to this user and not to the next one.
    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'it does not cache' do
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
      end
    end
  end

  get 'web_api/v1/home_pages/content_builder_layouts/:code' do
    let(:code) { 'homepage' }
    let(:cache_key) { "api_response/example.org/web_api/v1/home_pages/content_builder_layouts/#{code}.json" }

    before { create(:homepage_layout) }

    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'it caches' do
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_present
      end
    end
  end
end
