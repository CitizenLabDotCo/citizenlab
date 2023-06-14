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
      assert_status 200
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
    before { admin_header_token }

    get 'web_api/v1/nav_bar_items/removed_default_items' do
      before do
        create(:nav_bar_item, code: 'events')
      end

      let(:codes) { json_response_body[:data].map { |d| d.dig(:attributes, :code) } }

      example_request 'List removed default NavBarItems' do
        assert_status 200
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

    post 'web_api/v1/nav_bar_items' do
      with_options scope: :nav_bar_item do
        code_desc = "The code uniquely identifies default NavBarItems. One of: #{NavBarItem::CODES}."
        parameter :code, code_desc, required: true
        title_desc = 'The title of the NavBarItem, as a multiloc string. ' \
                     'Falls back to the default copy for default NavBarItems when not provided'
        parameter :title_multiloc, title_desc, required: false
        parameter :static_page_id, 'The ID of the static page for custom NavBarItems.', required: false
      end
      ValidationErrorHelper.new.error_fields self, NavBarItem
      ValidationErrorHelper.new.error_fields self, StaticPage

      describe do
        before do
          %w[projects custom].each { |c| create(:nav_bar_item, code: c) }
        end

        let(:code) { 'home' }

        example_request 'Add a default NavBarItem' do
          expect(response_status).to eq 201
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :code)).to eq code
          expect(json_response.dig(:data, :attributes, :ordering)).to eq 0
          expect(
            json_response.dig(:data, :attributes, :title_multiloc).stringify_keys
          ).to match({ 'en' => 'Home', 'fr-FR' => 'Accueil', 'nl-NL' => 'Home' })
        end
      end

      describe do
        let(:code) { 'custom' }
        let(:title_multiloc) { build(:nav_bar_item).title_multiloc }
        let(:static_page_id) { create(:static_page).id }

        example_request 'Add a custom NavBarItem' do
          expect(response_status).to eq 201
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :code)).to eq code
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :relationships, :static_page, :data, :id)).to eq static_page_id
        end
      end

      describe do
        let(:code) { 'custom' }
        let(:page_title_multiloc) { { 'en' => 'Referenda' } }
        let(:static_page_id) { create(:static_page, title_multiloc: page_title_multiloc).id }

        example_request 'Adding a custom NavBarItem without title, will use the page title instead' do
          expect(response_status).to eq 201
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :code)).to eq code
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match page_title_multiloc
          expect(json_response.dig(:data, :relationships, :static_page, :data, :id)).to eq static_page_id
        end
      end
    end

    patch 'web_api/v1/nav_bar_items/:id' do
      with_options scope: :nav_bar_item do
        title_desc = 'The title of the NavBarItem, as a multiloc string. ' \
                     'Falls back to the default copy for default NavBarItems when not provided'
        parameter :title_multiloc, title_desc
      end
      ValidationErrorHelper.new.error_fields self, NavBarItem

      let(:page) { create(:static_page, title_multiloc: { 'nl-NL' => 'Hoe deelnemen' }) }
      let(:item) { create(:nav_bar_item, static_page: page) }
      let(:id) { item.id }
      let(:title_multiloc) { { 'en' => 'How to participate' } }

      example_request 'Update a NavBarItem' do
        expect(response_status).to eq 200
        json_response = json_parse response_body

        expected_title = { 'en' => 'How to participate', 'nl-NL' => 'Hoe deelnemen' }
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match expected_title
      end
    end

    patch 'web_api/v1/nav_bar_items/:id/reorder' do
      with_options scope: :nav_bar_item do
        ordering_desc = 'The position, starting from 0, where the NavBarItem should be inserted at. ' \
                        'Items after this position will move to the right.'
        parameter :ordering, ordering_desc, required: true
      end

      let(:id) { create_list(:nav_bar_item, 3).map(&:reload).max_by(&:ordering).id } # Last item
      let(:ordering) { 1 }

      example_request 'Reorder a NavBarItem' do
        expect(response_status).to eq 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :ordering)).to eq ordering
      end
    end

    delete 'web_api/v1/nav_bar_items/:id' do
      let!(:id) { create(:nav_bar_item).id }

      example 'Delete a NavBarItem' do
        old_count = NavBarItem.count
        do_request
        expect(response_status).to eq 200
        expect { NavBarItem.find id }.to raise_error(ActiveRecord::RecordNotFound)
        expect(NavBarItem.count).to eq(old_count - 1)
      end
    end
  end

  context 'when resident' do
    before { resident_header_token }

    post 'web_api/v1/nav_bar_items' do
      parameter :code, scope: :nav_bar_item

      describe(document: false) do
        let(:code) { 'custom' }

        example_request('[error] Add a NavBarItem') { expect(response_status).to eq 401 }
      end
    end

    patch 'web_api/v1/nav_bar_items/:id' do
      parameter :title_multiloc, scope: :nav_bar_item

      describe(document: false) do
        let(:id) { create(:nav_bar_item).id }
        let(:title_multiloc) { { 'en' => 'How to participate' } }

        example_request('[error] Update a NavBarItem') { expect(response_status).to eq 401 }
      end
    end

    patch 'web_api/v1/nav_bar_items/:id/reorder' do
      parameter :ordering, scope: :nav_bar_item

      describe(document: false) do
        let(:id) { create(:nav_bar_item).id }
        let(:ordering) { 0 }

        example_request('[error] Reorder a NavBarItem') { expect(response_status).to eq 401 }
      end
    end

    delete 'web_api/v1/nav_bar_items/:id' do
      describe(document: false) do
        let(:id) { create(:nav_bar_item).id }

        example_request('[error] Delete a NavBarItem') { expect(response_status).to eq 401 }
      end
    end
  end
end
