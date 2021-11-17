require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'NavBarItems' do
  explanation 'E.g. home, projects, proposals, events...'

  before do
    header 'Content-Type', 'application/json'
  end

  # TODO: check calculated ordering? Maybe home at 0?

  context 'when admin' do
    before do
      @admin = create :admin
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/nav_bar_items' do
      with_options scope: :nav_bar_item do
        code_desc = "The code uniquely identifies default NavBarItems. One of: #{NavBarItem::CODES}."
        parameter :code, code_desc, required: true
        title_desc = 'The title of the NavBarItem, as a multiloc string.'\
                     ' Falls back to the default copy for default NavBarItems when not provided'
        parameter :title_multiloc, title_desc, required: false
        parameter :page_id, 'The ID of the page for custom NavBarItems.', required: false
      end
      ValidationErrorHelper.new.error_fields self, NavBarItem

      describe do
        let(:code) { 'home' }

        example_request 'Add a default NavBarItem' do
          expect(response_status).to eq 201
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :code)).to eq code
          expect(
            json_response.dig(:data, :attributes, :title_multiloc).stringify_keys
          ).to match MultilocService.new.i18n_to_multiloc('nav_bar_items.home.title')
        end
      end

      describe do
        let(:code) { 'custom' }
        let(:title_multiloc) { build(:nav_bar_item).title_multiloc }
        let(:page_id) { create(:page).id }

        example_request 'Add a custom NavBarItem' do
          expect(response_status).to eq 201
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :code)).to eq code
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :relationships, :page, :data, :id)).to eq page_id
        end
      end

      describe do
        let(:code) { 'custom' }
        let(:page_title_multiloc) { { 'en' => 'Referenda' } }
        let(:page_id) { create(:page, title_multiloc: page_title_multiloc).id }

        example_request 'Adding a custom NavBarItem without title, will use the page title instead' do
          expect(response_status).to eq 201
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :code)).to eq code
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match page_title_multiloc
          expect(json_response.dig(:data, :relationships, :page, :data, :id)).to eq page_id
        end
      end
    end

    patch 'web_api/v1/nav_bar_items/:id' do
      with_options scope: :nav_bar_item do
        title_desc = 'The title of the NavBarItem, as a multiloc string.'\
                     ' Falls back to the default copy for default NavBarItems when not provided'
        parameter :title_multiloc, title_desc
        parameter :page_id, 'The ID of the page for custom NavBarItems.'
      end
      ValidationErrorHelper.new.error_fields self, NavBarItem

      let(:item) { create :nav_bar_item }
      let(:id) { item.id }
      let(:title_multiloc) { { 'en' => 'How to participate' } }
      let(:page_id) { create(:page).id }

      example_request 'Update a NavBarItem' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :relationships, :page, :data, :id)).to eq page_id
      end
    end

    patch 'web_api/v1/nav_bar_items/:id/reorder' do
      with_options scope: :nav_bar_item do
        ordering_desc = 'The position, starting from 0, where the NavBarItem should be inserted at.'\
                        ' Items after this position will move to the right.'
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
        expect(NavBarItem.count).to eq (old_count - 1)
      end
    end
  end

  context 'when normal user' do
    before do
      @user = create :user
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

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
