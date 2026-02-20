# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Feed Ideas', :clear_cache, document: false do
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature! 'aggressive_caching'
  end

  get 'web_api/v1/phases/:phase_id/idea_feed/ideas' do
    let(:phase) { create(:idea_feed_phase) }
    let(:phase_id) { phase.id }
    let!(:ideas) { create_list(:idea, 2, project: phase.project, phases: [phase]) }

    let(:cache_key) do
      query = { topics: nil, page_size: 20, phase: phase_id, exposure_ids: [] }.to_query
      "api_response/example.org/web_api/v1/phases/#{phase_id}/idea_feed/ideas?#{query}.json"
    end

    example 'caches for a visitor' do
      expect(Rails.cache.read(cache_key)).to be_nil
      do_request
      expect(status).to eq 200
      expect(Rails.cache.read(cache_key)).to be_present
    end

    context 'when logged in' do
      before { header_token_for create(:user) }

      example 'does not cache' do
        expect(Rails.cache.read(cache_key)).to be_nil
        do_request
        expect(status).to eq 200
        expect(Rails.cache.read(cache_key)).to be_nil
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
