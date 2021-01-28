require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Pages" do

  explanation "Pages with HTML content (e.g. privacy-policy, cookie-policy)."

  before do
    @pages = create_list(:page, 5)
    @user = create(:user, roles: [{type: 'admin'}])
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get "web_api/v1/pages" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of pages (data model pages) per page"
    end
    parameter :project, "The id of a project, if you want the pages for that project only"

    describe do
      before do
        @pages.drop(1).each_with_index{|p,i| create(:page_link, linking_page: @pages.first, linked_page: p, ordering: i+1)}
      end
      example_request "List all pages" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
      end
    end

    example "List all pages in a project" do
      project = create(:project)
      pages = create_list(:page, 3, project: project)

      do_request project: project.id

      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end
  end

  get "web_api/v1/pages" do
    example "Get all pages on the second page with fixed page size" do
      do_request({"page[number]" => 2, "page[size]" => 2})
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/pages/:id" do
    let(:id) { @pages.first.id }

    example_request "Get one page by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @pages.first.id
    end

    describe do
      before do
        @pages.drop(1).each_with_index{|p,i| create(:page_link, linking_page: @pages.first, linked_page: p, ordering: i+1)}
      end

      example_request "Get all linked pages of a linking page", document: false do 
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:included).size).to eq (@pages.size - 1) # links to all other pages
        expect(json_response.dig(:included).first.dig(:attributes, :ordering)).to be_present
        expect(json_response.dig(:included).first.dig(:attributes, :linked_page_title_multiloc)).to be_present
      end
    end
  end

  get "web_api/v1/pages/by_slug/:slug" do
    let(:slug) { @pages.first.slug }

    example_request "Get one page by slug" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @pages.first.id
    end

    describe do
      let(:slug) { "unexisting-page" }

      example_request "[error] Get an unexisting page by slug", document: false do
        expect(status).to eq 404
      end
    end
  end

  post "web_api/v1/pages" do
    with_options scope: :page do
      parameter :title_multiloc, "The title of the page, as a multiloc string", required: true
      parameter :body_multiloc, "The content of the page, as a multiloc HTML string", required: true
      parameter :publication_status, "Whether the page is publicly accessible. Either #{Page::PUBLICATION_STATUSES.join(" or ")}, defaults to published", required: false
      parameter :slug, "The unique slug of the page. If not given, it will be auto generated"
    end
    ValidationErrorHelper.new.error_fields(self, Page)

    let(:page) { build(:page) }
    let(:title_multiloc) { page.title_multiloc }
    let(:body_multiloc) { page.body_multiloc }

    describe do
      example_request "Create a page" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
        expect(json_response.dig(:data,:attributes,:publication_status)).to eq 'published'
      end
    end

    describe do
      let (:slug) { '' }
      
      example_request "[error] Create an invalid page", document: false do
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors,:slug)).to eq [{:error=>"blank"}]
      end
    end
  end

  patch "web_api/v1/pages/:id" do
    before do 
      @page = create(:page)
    end

    with_options scope: :page do
      parameter :title_multiloc, "The title of the page, as a multiloc string", required: true
      parameter :body_multiloc, "The content of the page, as a multiloc HTML string", required: true
      parameter :slug, "The unique slug of the page"
      parameter :publication_status, "Whether the page is publicly accessible. Either #{Page::PUBLICATION_STATUSES.join(" or ")}.", required: false
    end
    ValidationErrorHelper.new.error_fields(self, Page)

    let(:id) { @page.id }
    let(:title_multiloc) { {"en" => "Changed title" } }
    let(:body_multiloc) { {"en" => "Changed body" } }
    let(:publication_status) { 'draft' }
    let(:slug) { "changed-title" }

    example_request "Update a page" do
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc,:en)).to eq "Changed title"
      expect(json_response.dig(:data,:attributes,:body_multiloc,:en)).to eq "Changed body"
      expect(json_response.dig(:data,:attributes,:slug)).to eq "changed-title"
      expect(json_response.dig(:data,:attributes,:publication_status)).to eq 'draft'
    end
  end

  delete "web_api/v1/pages/:id" do
    let(:page) { create(:page) }
    let(:id) { page.id }
    
    example_request "Delete a page" do
      expect(response_status).to eq 200
      expect{Page.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
