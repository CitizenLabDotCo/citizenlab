# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'StaticPages' do
  explanation 'Pages with static HTML content (e.g. privacy policy, cookie policy).'

  let(:json_response) { json_parse response_body }

  before do
    @pages = create_list(:static_page, 2)
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/static_pages' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of pages (data model pages) per page'
    end

    example_request 'List all static pages' do
      expect(status).to eq 200
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/static_pages/:id' do
    let(:page) { @pages.first }
    let(:id) { page.id }

    example_request 'Get one page by id' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get 'web_api/v1/static_pages/by_slug/:slug' do
    let(:page) { @pages.first }
    let(:slug) { page.slug }

    example_request 'Get one static page by slug' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq page.id
    end

    describe nil do
      let(:slug) { 'unexisting-page' }

      example '[error] Get an unexisting static page by slug', document: false do
        do_request
        expect(status).to eq 404
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    patch 'web_api/v1/static_pages/:id' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the static page, as a multiloc string'
        parameter :slug, 'The unique slug of the static page. If not given, it will be auto generated'
        parameter :banner_enabled, 'if banner is enabled'
        parameter :banner_layout, 'the specific layout for the banner, one of: full_width_banner_layout two_column_layout two_row_layout fixed_ratio_layout'
        parameter :banner_overlay_color, 'color of the banner overlay'
        parameter :banner_overlay_opacity, 'opacity of the banner overlay'
        parameter :banner_cta_button_multiloc, 'multiloc content for the CTA button'
        parameter :banner_cta_button_type, 'type of the CTA, one of: customized_button no_button'
        parameter :banner_cta_button_url, 'url for the CTA'
        parameter :banner_header_multiloc, 'multiloc content for the banner header'
        parameter :banner_subheader_multiloc, 'multiloc content for the banner subheader'
        parameter :top_info_section_enabled, 'if the top info section is enabled'
        parameter :top_info_section_multiloc, 'The top content of the static page, as a multiloc HTML string'
        parameter :files_section_enabled, 'if the files section is enabled'
        parameter :projects_enabled, 'if the projects section is enabled'
        parameter :projects_filter_type, 'the filter used to filter projects for the projects in the projects section, one of: area topics'
        parameter :events_widget_enabled, 'if events section is enabled'
        parameter :bottom_info_section_enabled, 'if the bottom info section is enabled'
        parameter :bottom_info_section_multiloc, 'The bottom content of the static page, as a multiloc HTML string'
        parameter :header_bg, 'image for the header background'
        parameter :topic_ids, 'the IDs of topics that are used to filter the page projects list', type: :array
        parameter :area_ids, 'the ID of an area that is used to filter the page projects list', type: :array
      end
      ValidationErrorHelper.new.error_fields self, StaticPage

      let(:page) { @pages.first }
      let(:id) { page.id }
      let(:title_multiloc) { { en: 'New title' } }
      let(:top_info_section_multiloc) { { en: 'New top info section text' } }
      let(:bottom_info_section_multiloc) { { en: 'New bottom info section text' } }

      example_request 'Update a static page' do
        assert_status 200

        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to match 'New title'
        expect(json_response.dig(:data, :attributes, :top_info_section_multiloc, :en)).to match 'New top info section text'
        expect(json_response.dig(:data, :attributes, :bottom_info_section_multiloc, :en)).to match 'New bottom info section text'
        expect(json_response.dig(:data, :attributes, :code)).to eq 'custom'
      end

      # Although the info section WYSIWYG for static pages does not support HTML tables,
      # we sometimes use a static_page for custom content that can include tables.
      # In such cases we save the HTML to the multiloc field directly.
      example 'Update a static page with table elements in info section' do
        table_html = <<~HTML
          <table style="width:100%;border-collapse:collapse;display:table !important;border:1px solid #ddd;">
            <tr style="display:table-row !important;">
              <th style="width:80px;border:1px solid #ddd;padding:5px;text-align:left;display:table-cell !important;">Verktøy</th>
            </tr>
            <tr style="display:table-row !important;">
              <td style="border:1px solid #ddd;padding:5px;text-align:left;display:table-cell !important;">Matomo</td>
            </tr>
          </table>
        HTML

        top_info_section_multiloc = { en: table_html.strip }

        do_request(static_page: { top_info_section_multiloc: top_info_section_multiloc })
        assert_status 200

        expect(json_response.dig(:data, :attributes, :top_info_section_multiloc, :en).strip).to eq(top_info_section_multiloc[:en])
      end

      describe 'updating topics' do
        let(:projects_filter_type) { 'topics' }
        let(:topic1) { create(:topic) }
        let(:topic2) { create(:topic) }
        let(:topic_ids) { [topic1.id, topic2.id] }

        example_request 'set topics for projects list' do
          json_response = json_parse(response_body)
          expect(response_status).to eq 200
          expect(json_response.dig(:data, :relationships, :topics, :data).length).to eq(2)
        end

        context 'when wrong project filter type is set' do
          let(:projects_filter_type) { 'areas' }

          example_request 'attempt to update page' do
            expect(response_status).to eq 422
          end
        end

        context 'when no topic ids in request' do
          let(:topic_ids) { [] }

          example_request 'attempt to update page' do
            expect(response_status).to eq 422
          end
        end
      end

      describe 'updating areas' do
        let(:projects_filter_type) { 'areas' }
        let(:area1) { create(:area) }
        let(:area2) { create(:area) }
        let(:area_ids) { [area1.id] }

        example_request 'set an area for projects list' do
          json_response = json_parse(response_body)
          expect(response_status).to eq 200
          expect(json_response.dig(:data, :relationships, :areas, :data).length).to eq(1)
        end

        context 'when wrong project filter type is set' do
          let(:projects_filter_type) { 'topics' }

          example_request 'attempt to update page' do
            expect(response_status).to eq 422
          end
        end

        context 'when no area ids in request' do
          let(:area_ids) { [] }

          example_request 'attempt to update page' do
            expect(response_status).to eq 422
          end
        end

        context 'when when more than one area ids in request' do
          let(:area_ids) { [area1.id, area2.id] }

          example_request 'attempt to update page' do
            expect(response_status).to eq 422
          end
        end
      end
    end

    post 'web_api/v1/static_pages' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the static page, as a multiloc string'
        parameter :slug, 'The unique slug of the static page. If not given, it will be auto generated'
        parameter :banner_enabled, 'if banner is enabled'
        parameter :banner_layout, 'the specific layout for the banner, one of: full_width_banner_layout two_column_layout two_row_layout fixed_ratio_layout'
        parameter :banner_overlay_color, 'color of the banner overlay'
        parameter :banner_overlay_opacity, 'opacity of the banner overlay'
        parameter :banner_cta_button_multiloc, 'multiloc content for the CTA button'
        parameter :banner_cta_button_type, 'type of the CTA, one of: customized_button no_button'
        parameter :banner_cta_button_url, 'url for the CTA'
        parameter :banner_header_multiloc, 'multiloc content for the banner header'
        parameter :banner_subheader_multiloc, 'multiloc content for the banner subheader'
        parameter :top_info_section_enabled, 'if the top info section is enabled'
        parameter :top_info_section_multiloc, 'The top content of the static page, as a multiloc HTML string'
        parameter :files_section_enabled, 'if the files section is enabled'
        parameter :projects_enabled, 'if the projects section is enabled'
        parameter :projects_filter_type, 'the filter used to filter projects for the projects in the projects section, one of: area topics'
        parameter :events_widget_enabled, 'if events section is enabled'
        parameter :bottom_info_section_enabled, 'if the bottom info section is enabled'
        parameter :bottom_info_section_multiloc, 'The bottom content of the static page, as a multiloc HTML string'
        parameter :header_bg, 'image for the header background'
        parameter :nav_bar_item_title_multiloc, 'The title of the corresponding NavBarItem'
      end

      ValidationErrorHelper.new.error_fields self, StaticPage
      ValidationErrorHelper.new.error_fields self, NavBarItem

      let(:page) { build(:static_page) }
      let(:title_multiloc) { page.title_multiloc }
      let(:top_info_section_multiloc) { page.top_info_section_multiloc }

      example_request 'Create a static page' do
        assert_status 201

        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match page.title_multiloc
        expect(json_response.dig(:data, :attributes, :top_info_section_multiloc).stringify_keys).to match page.top_info_section_multiloc
        expect(json_response.dig(:data, :attributes, :code)).to eq 'custom'
      end

      example 'Does not create a NavBarItem' do
        item_title_multiloc = { 'en' => 'Awesome item' }

        do_request(
          static_page: {
            title_multiloc: page.title_multiloc,
            top_info_section_multiloc: page.top_info_section_multiloc,
            nav_bar_item_title_multiloc: item_title_multiloc
          }
        )
        expect(response_status).to eq 201
        json_response = json_parse response_body
        expect(StaticPage.find(json_response.dig(:data, :id)).nav_bar_item).to be_nil
      end

      describe nil do
        let(:slug) { '' }

        example '[error] Create an invalid static page', document: false do
          do_request
          assert_status 422
          expect(json_response).to include_response_error(:slug, 'blank')
        end
      end
    end

    patch 'web_api/v1/static_pages/:id' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the static page, as a multiloc string'
        parameter :top_info_section_multiloc, 'The content of the static page, as a multiloc HTML string'
        parameter :slug, 'The unique slug of the static page'
        parameter :nav_bar_item_title_multiloc, 'The title of the corresponding NavBarItem'
      end

      ValidationErrorHelper.new.error_fields self, StaticPage
      ValidationErrorHelper.new.error_fields self, NavBarItem

      let(:page) { @pages.first }
      let(:id) { page.id }
      let(:title_multiloc) { { 'en' => 'Changed title' } }
      let(:top_info_section_multiloc) { { 'en' => 'Changed body' } }
      let(:slug) { 'changed-title' }

      example_request 'Update a static page' do
        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
        expect(json_response.dig(:data, :attributes, :top_info_section_multiloc, :en)).to eq 'Changed body'
        expect(json_response.dig(:data, :attributes, :slug)).to eq 'changed-title'
      end

      example 'Update the NavBarItem title of a static page' do
        title_multiloc = { 'en' => 'Awesome item' }
        item = create(:nav_bar_item, static_page: page)

        do_request(static_page: { nav_bar_item_title_multiloc: title_multiloc })
        assert_status 200
        expect(item.reload.title_multiloc).to match title_multiloc
      end

      example 'Update the NavBarItem title of a static page with no NavBarItem' do
        title_multiloc = { 'en' => 'Awesome item' }
        page.nav_bar_item&.destroy!
        do_request(static_page: { nav_bar_item_title_multiloc: title_multiloc })
        assert_status 200
      end
    end

    delete 'web_api/v1/static_pages/:id' do
      let(:page) { @pages.first }
      let(:id) { page.id }

      example_request 'Delete a static page' do
        assert_status 200
        expect { page.reload }.to raise_error ActiveRecord::RecordNotFound
      end

      context 'when the page has a code other than \'custom\'' do
        before { page.update!(code: 'faq', slug: 'faq') }

        example_request 'Delete a static page' do
          assert_status 422
          expect { page.reload }.not_to raise_error ActiveRecord::RecordNotFound
        end
      end
    end
  end
end
