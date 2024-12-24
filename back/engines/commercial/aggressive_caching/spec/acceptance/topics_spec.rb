# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Topics', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    settings = AppConfiguration.instance.settings
    settings['aggressive_caching'] = { 'enabled' => true, 'allowed' => true }
    AppConfiguration.instance.update!(settings:)
  end

  get 'web_api/v1/topics' do
    example 'caches for a visitor' do
      expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_present
    end

    context 'when logged in and following something' do
      before { header_token_for create(:follower).user }

      example 'it does not cache' do
        expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_nil
      end
    end

    context 'when logged in and not following anything' do
      before { header_token_for create(:user) }

      example 'it caches' do
        expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_present
      end
    end

    context 'with aggressive caching disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['aggressive_caching'] = { 'enabled' => false, 'allowed' => true }
        AppConfiguration.instance.update!(settings:)
      end

      example 'does not cache' do
        expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read('views/example.org/web_api/v1/topics.json')).to be_nil
      end
    end
  end

  get 'web_api/v1/topics/:id' do
    let(:topic) { create(:topic) }
    let(:id) { topic.id }

    example 'caches for a visitor' do
      expect(Rails.cache.read("views/example.org/web_api/v1/topics/#{id}.json")).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read("views/example.org/web_api/v1/topics/#{id}.json")).to be_present
    end

    context 'when logged in and not following' do
      before { header_token_for create(:user) }

      example 'it caches' do
        expect(Rails.cache.read("views/example.org/web_api/v1/topics/#{id}.json")).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read("views/example.org/web_api/v1/topics/#{id}.json")).to be_present
      end
    end

    context 'with aggressive caching disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['aggressive_caching'] = { 'enabled' => false, 'allowed' => true }
        AppConfiguration.instance.update!(settings:)
      end

      example 'does not cache' do
        expect(Rails.cache.read("views/example.org/web_api/v1/topics/#{id}.json")).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read("views/example.org/web_api/v1/topics/#{id}.json")).to be_nil
      end
    end
  end
end
