# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'GlobalTopics', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature! 'aggressive_caching'
  end

  get 'web_api/v1/global_topics' do
    let(:cache_key) { 'api_response/example.org/web_api/v1/global_topics.json' }

    example 'caches for a visitor' do
      expect(Rails.cache.read(cache_key)).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read(cache_key)).to be_present
    end

    context 'when logged in and following something' do
      before { header_token_for create(:follower).user }

      example 'it does not cache' do
        expect(Rails.cache.read(cache_key)).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
      end
    end

    context 'when logged in and not following anything' do
      before { header_token_for create(:user) }

      example 'it caches' do
        expect(Rails.cache.read(cache_key)).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_present
      end
    end

    context 'with aggressive caching disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['aggressive_caching'] = { 'enabled' => false, 'allowed' => true }
        AppConfiguration.instance.update!(settings:)
      end

      example 'does not cache' do
        expect(Rails.cache.read(cache_key)).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
      end
    end
  end

  get 'web_api/v1/global_topics/:id' do
    let(:global_topic) { create(:topic) }
    let(:id) { global_topic.id }
    let(:cache_key) { "api_response/example.org/web_api/v1/global_topics/#{id}.json" }

    example 'caches for a visitor' do
      expect(Rails.cache.read(cache_key)).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read(cache_key)).to be_present
    end

    context 'when logged in and not following' do
      before { header_token_for create(:user) }

      example 'it caches' do
        expect(Rails.cache.read(cache_key)).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_present
      end
    end

    context 'with aggressive caching disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['aggressive_caching'] = { 'enabled' => false, 'allowed' => true }
        AppConfiguration.instance.update!(settings:)
      end

      example 'does not cache' do
        expect(Rails.cache.read(cache_key)).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
      end
    end
  end
end
