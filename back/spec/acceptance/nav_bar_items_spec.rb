require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'NavBarItems' do
  explanation 'E.g. home, projects, proposals, events...'

  before do
    header 'Content-Type', 'application/json'
    @items = [
      create(:nav_bar_item, code: 'custom'),
      create(:nav_bar_item, code: 'events'),
      create(:nav_bar_item, code: 'home')
    ]
    @items.last.move_to_top # home, custom, events
  end

  get 'web_api/v1/nav_bar_items' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of topics per page'
    end

    example_request 'List all NavBarItems' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map { |d| d.dig(:attributes, :ordering) }).to eq [0, 1, 2]
      expect(json_response[:data].map { |d| d.dig(:attributes, :code) }).to eq %w[home custom events]
    end
  end
end
