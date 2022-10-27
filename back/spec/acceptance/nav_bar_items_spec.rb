# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'NavBarItems' do
  explanation 'E.g. home, projects, proposals, events...'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/nav_bar_items' do
    before do
      @items = [
        create(:nav_bar_item, code: 'custom'),
        create(:nav_bar_item, code: 'proposals'),
        create(:nav_bar_item, code: 'events'),
        create(:nav_bar_item, code: 'home')
      ]
      @items.last.move_to_top # home, custom, events
    end

    example_request 'List all NavBarItems' do
      expect(status).to eq 200
      expect(json_response_body[:data].size).to eq 4
      expect(json_response_body[:data].map { |d| d.dig(:attributes, :ordering) }).to eq [0, 1, 2, 3]
      expect(json_response_body[:data].map { |d| d.dig(:attributes, :code) }).to eq %w[home custom proposals events]
    end

    context 'when NavBarItem is disabled by corresponding disabled feature' do
      before do
        SettingsService.new.deactivate_feature!('initiatives')
      end

      example_request 'Does not list feature-disabled NavBarItems' do
        expect(json_response_body[:data].map { |d| d.dig(:attributes, :code) }).to eq %w[home custom events]
      end
    end
  end

  context 'when admin' do
    before do
      @admin = create :admin
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    get 'web_api/v1/nav_bar_items/removed_default_items' do
      before do
        create :nav_bar_item, code: 'events'
      end

      let(:codes) { json_response_body[:data].map { |d| d.dig(:attributes, :code) } }

      example_request 'List removed default NavBarItems' do
        expect(status).to eq 200
        expect(json_response_body[:data].size).to be > 0
        expect(codes).to include 'home'
        expect(codes).to include 'proposals'
        expect(codes).not_to include 'events'
      end

      context 'when NavBarItem is disabled by corresponding disabled feature' do
        before do
          SettingsService.new.deactivate_feature!('initiatives')
        end

        example_request 'Does not list removed default but feature-disabled NavBarItems' do
          expect(codes).to include 'home'
          expect(codes).not_to include 'proposals'
          expect(codes).not_to include 'events'
        end
      end
    end
  end
end
