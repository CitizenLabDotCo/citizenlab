# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'StaticPages', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    settings = AppConfiguration.instance.settings
    settings['aggressive_caching'] = { 'enabled' => true, 'allowed' => true }
    AppConfiguration.instance.update!(settings:)
  end

  get 'web_api/v1/static_pages' do
    example 'Caches for a visitor' do
      expect(Rails.cache.read('views/example.org/web_api/v1/static_pages.json')).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read('views/example.org/web_api/v1/static_pages.json')).to be_present
    end
  end
end
