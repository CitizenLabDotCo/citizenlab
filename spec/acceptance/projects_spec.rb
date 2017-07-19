require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Projects" do
  before do
    @projects = create_list(:project, 5)
    @user = create(:user, roles: [{type: 'admin'}])
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get "api/v1/projects" do
    example_request "List all projects" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "api/v1/projects" do
    example "Get all projects on the second page with fixed page size" do
      do_request({"page[number]" => 2, "page[size]" => 2})
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "api/v1/projects/:id" do
    let(:id) {@projects.first.id}

    example_request "Get a project by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @projects.first.id
    end
  end

  get "api/v1/projects/by_slug/:slug" do
    let(:slug) {@projects.first.slug}

    example_request "Get a project by slug" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @projects.first.id
    end

    describe do
      let(:slug) {"unexisting-project"}
      example "get an unexisting project by slug triggers 404", document: false do
        do_request
        expect(status).to eq 404
      end
    end
  end

  post "api/v1/projects" do
    with_options scope: :project do
      parameter :title_multiloc, "The title of the project, as a multiloc string", required: true
      parameter :description_multiloc, "The description of the project, as a multiloc HTML string", required: true
      parameter :slug, "The unique slug of the project. If not given, it will be auto generated"
      parameter :header_bg, "Base64 encoded header image"

    end

    let(:project) { build(:project) }
    let(:title_multiloc) { project.title_multiloc }
    let(:description_multiloc) { project.description_multiloc }
    let(:header_bg) { encode_image_as_base64("header.jpg")}


    example_request "Create a project" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
    end
  end

  patch "api/v1/projects/:id" do
    before do 
      @project = create(:project)
    end

    with_options scope: :project do
      parameter :title_multiloc, "The title of the project, as a multiloc string", required: true
      parameter :description_multiloc, "The description of the project, as a multiloc HTML string", required: true
      parameter :slug, "The unique slug of the project"
      parameter :header_bg, "Base64 encoded header image"
    end

    let(:id) { @project.id }
    let(:title_multiloc) { {"en" => "Changed title" } }
    let(:description_multiloc) { {"en" => "Changed body" } }
    let(:slug) { "changed-title" }
    let(:header_bg) { encode_image_as_base64("header.jpg")}

    example_request "Updating the project" do
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc,:en)).to eq "Changed title"
      expect(json_response.dig(:data,:attributes,:description_multiloc,:en)).to eq "Changed body"
      expect(json_response.dig(:data,:attributes,:slug)).to eq "changed-title"
    end
  end


  delete "api/v1/projects/:id" do
    let(:project) { create(:project) }
    let(:id) { project.id }
    example_request "Delete a project" do
      expect(response_status).to eq 200
      expect{Project.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  private

  def encode_image_as_base64 filename
    "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
  end
end
