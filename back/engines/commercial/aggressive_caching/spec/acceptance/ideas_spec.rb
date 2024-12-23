# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    settings = AppConfiguration.instance.settings
    settings['aggressive_caching'] = { 'enabled' => true, 'allowed' => true }
    AppConfiguration.instance.update!(settings:)
  end

  get 'web_api/v1/ideas' do
    example 'caches for a visitor' do
      expect(Rails.cache.read('views/example.org/web_api/v1/ideas.json')).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read('views/example.org/web_api/v1/ideas.json')).to be_present
    end

    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'does not cache' do
        expect(Rails.cache.read('views/example.org/web_api/v1/ideas.json')).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read('views/example.org/web_api/v1/ideas.json')).to be_nil
      end
    end

    context 'with aggressive caching disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['aggressive_caching'] = { 'enabled' => false, 'allowed' => true }
        AppConfiguration.instance.update!(settings:)
      end

      example 'does not cache' do
        expect(Rails.cache.read('views/example.org/web_api/v1/ideas.json')).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read('views/example.org/web_api/v1/ideas.json')).to be_nil
      end
    end
  end

  get 'web_api/v1/ideas/:id' do
    let(:idea) { create(:idea) }
    let(:id) { idea.id }

    example 'caches for a visitor' do
      expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}.json")).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}.json")).to be_present
    end

    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'does not cache' do
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}.json")).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}.json")).to be_nil
      end
    end

    context 'with aggressive caching disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['aggressive_caching'] = { 'enabled' => false, 'allowed' => true }
        AppConfiguration.instance.update!(settings:)
      end

      example 'does not cache' do
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}.json")).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}.json")).to be_nil
      end
    end
  end

  get 'web_api/v1/ideas/:id/similarities' do
    let(:idea) { create(:embeddings_similarity).embeddable }
    let(:id) { idea.id }

    example 'caches for a visitor' do
      expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}/similarities.json")).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}/similarities.json")).to be_present
    end

    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'does not cache' do
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}/similarities.json")).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}/similarities.json")).to be_nil
      end
    end

    context 'with aggressive caching disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['aggressive_caching'] = { 'enabled' => false, 'allowed' => true }
        AppConfiguration.instance.update!(settings:)
      end

      example 'does not cache' do
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}/similarities.json")).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read("views/example.org/web_api/v1/ideas/#{id}/similarities.json")).to be_nil
      end
    end
  end
end
