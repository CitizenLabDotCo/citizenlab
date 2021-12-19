require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'NavBarItems' do
  explanation 'E.g. home, projects, proposals, events...'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/nav_bar_items' do
    before do
      @items = [
        create(:nav_bar_item, code: 'custom'),
        create(:nav_bar_item, code: 'events'),
        create(:nav_bar_item, code: 'home')
      ]
      @items.last.move_to_top # home, custom, events
    end

    example_request 'List all NavBarItems' do
      expect(status).to eq 200
      json_response = json_parse response_body
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map { |d| d.dig(:attributes, :ordering) }).to eq [0, 1, 2]
      expect(json_response[:data].map { |d| d.dig(:attributes, :code) }).to eq %w[home custom events]
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

      example_request 'List removed default NavBarItems' do
        expect(status).to eq 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to be > 0
        expect(json_response[:data].map { |d| d.dig(:attributes, :code) }).to include 'home'
        expect(json_response[:data].map { |d| d.dig(:attributes, :code) }).not_to include 'events'
      end
    end

    %w[proposals events all_input].each do |code|
      post "web_api/v1/nav_bar_items/toggle_#{code}" do
        parameter :enabled, 'Boolean value to decide whether to add (enable) or remove (disable) the item.'

        example "Enable #{code}" do
          do_request enabled: true
          expect(status).to eq 201
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes, :code)).to eq code
          expect(NavBarItem.find_by(code: code)).to be_present
        end

        example "Disable #{code}" do
          create :nav_bar_item, code: code
          do_request enabled: false
          expect(status).to eq 200
          expect(NavBarItem.find_by(code: code)).to be_blank
        end
      end
    end
  end
end
