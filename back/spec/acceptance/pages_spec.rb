require 'rails_helper'
require 'rspec_api_documentation/dsl'

# TODO: check code in response
# TODO: auto set code to custom?
# TODO: by_code?
# TODO: PATCH navbar title

resource 'Pages' do
  explanation 'Pages with static HTML content (e.g. privacy policy, cookie policy).'

  let(:json_response) { json_parse(response_body) }

  before do
    @pages = create_list(:page, 3)
    @user = create(:user, roles: [{ type: 'admin' }])
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/pages' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of pages (data model pages) per page'
    end

    example_request 'List all pages' do
      expect(status).to eq(200)
      expect(json_response[:data].size).to eq 3
    end
  end

  get 'web_api/v1/pages/:id' do
    let(:page) { @pages.first }
    let(:id) { page.id }

    example_request 'Get one page by id' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get 'web_api/v1/pages/by_slug/:slug' do
    let(:page) { @pages.first }
    let(:slug) { page.slug }

    example_request 'Get one page by slug' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq page.id
    end

    describe do
      let(:slug) { 'unexisting-page' }

      example_request '[error] Get an unexisting page by slug', document: false do
        expect(status).to eq 404
      end
    end
  end

  post 'web_api/v1/pages' do
    with_options scope: :page do
      parameter :title_multiloc, 'The title of the page, as a multiloc string', required: true
      parameter :body_multiloc, 'The content of the page, as a multiloc HTML string', required: true
      parameter :slug, 'The unique slug of the page. If not given, it will be auto generated'
    end
    ValidationErrorHelper.new.error_fields(self, Page)

    let(:page) { build(:page) }
    let(:title_multiloc) { page.title_multiloc }
    let(:body_multiloc) { page.body_multiloc }

    example_request 'Create a page' do
      expect(response_status).to eq 201

      expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match page.title_multiloc
      expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match page.body_multiloc
    end

    describe do
      let(:slug) { '' }

      example_request '[error] Create an invalid page', document: false do
        expect(response_status).to eq 422
        expect(json_response.dig(:errors, :slug)).to eq [{ error: 'blank' }]
      end
    end
  end

  patch 'web_api/v1/pages/:id' do
    with_options scope: :page do
      parameter :title_multiloc, "The title of the page, as a multiloc string", required: true
      parameter :body_multiloc, "The content of the page, as a multiloc HTML string", required: true
      parameter :slug, "The unique slug of the page"
    end
    ValidationErrorHelper.new.error_fields(self, Page)

    before do
      @page = create(:page)
    end

    let(:id) { @page.id }
    let(:title_multiloc) { {'en' => 'Changed title' } }
    let(:body_multiloc) { {'en' => 'Changed body' } }
    let(:slug) { 'changed-title' }

    example_request 'Update a page' do
      expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
      expect(json_response.dig(:data, :attributes, :body_multiloc, :en)).to eq 'Changed body'
      expect(json_response.dig(:data, :attributes, :slug)).to eq 'changed-title'
    end
  end

  delete 'web_api/v1/pages/:id' do
    let(:page) { create(:page) }
    let(:id) { page.id }

    example_request 'Delete a page' do
      expect(response_status).to eq 200
      expect { page.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
