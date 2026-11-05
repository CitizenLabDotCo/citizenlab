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
  end
end
