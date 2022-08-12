# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'CustomPages' do
  explanation 'Pages with custom content'

  let(:json_response) { json_parse response_body }

  before do
    @pages = create_list :custom_page, 2
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/custom_pages' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of pages (data model pages) per page'
    end

    example_request 'List all custom pages' do
      expect(status).to eq 200
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/custom_pages/:id' do
    let(:page) { @pages.first }
    let(:id) { page.id }

    example_request 'Get one page by id' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get 'web_api/v1/custom_pages/by_slug/:slug' do
    let(:page) { @pages.first }
    let(:slug) { page.slug }

    example_request 'Get one custom page by slug' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq page.id
    end

    describe nil do
      let(:slug) { 'nonexistent-page' }

      example_request '[error] Get an nonexistent custom page by slug', document: false do
        expect(status).to eq 404
      end
    end
  end

  context 'when admin' do
    before do
      @admin = create :admin
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/custom_pages' do
      with_options scope: :custom_page do
        parameter :title_multiloc, 'The title of the custom page, as a multiloc string', required: true
        parameter :bottom_info_section_multiloc, 'Some content on the custom page, as a multiloc HTML string', required: true
        parameter :slug, 'The unique slug of the custom page. If not given, it will be auto generated'
      end
      ValidationErrorHelper.new.error_fields self, CustomPage

      let(:page) { build :custom_page }
      let(:title_multiloc) { page.title_multiloc }
      let(:bottom_info_section_multiloc) { page.bottom_info_section_multiloc }

      example_request 'Create a custom page' do
        assert_status 201

        puts page.inspect

        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match page.title_multiloc
        expect(json_response.dig(:data, :attributes, :bottom_info_section_multiloc).stringify_keys).to match page.bottom_info_section_multiloc
        expect(json_response.dig(:data, :attributes, :code)).to eq 'custom'
      end

      describe nil do
        let(:slug) { '' }

        example_request '[error] Create an invalid custom page', document: false do
          assert_status 422
          expect(json_response).to include_response_error(:slug, 'blank')
        end
      end
    end

    patch 'web_api/v1/custom_pages/:id' do
      with_options scope: :custom_page do
        parameter :title_multiloc, 'The title of the custom page, as a multiloc string'
        parameter :bottom_info_section_multiloc, 'Some content on the custom page, as a multiloc HTML string'
        parameter :slug, 'The unique slug of the custom page'
      end
      ValidationErrorHelper.new.error_fields self, CustomPage

      let(:id) { @pages.first.id }
      let(:title_multiloc) { { 'en' => 'Changed title' } }
      let(:bottom_info_section_multiloc) { { 'en' => 'Changed bottom info section' } }
      let(:slug) { 'changed-title' }

      example_request 'Update a custom page' do
        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
        expect(json_response.dig(:data, :attributes, :bottom_info_section_multiloc, :en)).to eq 'Changed bottom info section'
        expect(json_response.dig(:data, :attributes, :slug)).to eq 'changed-title'
      end
    end

    delete 'web_api/v1/custom_pages/:id' do
      let(:page) { @pages.first }
      let(:id) { page.id }

      example_request 'Delete a custom page' do
        assert_status 200
        expect { page.reload }.to raise_error ActiveRecord::RecordNotFound
      end
    end
  end
end
