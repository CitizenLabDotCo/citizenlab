require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Tags" do

  explanation "Labels for processing content"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get 'web_api/v1/tags' do
    before do
      @project = create(:project_with_current_phase, with_permissions: true)

      @ideas = create_list(:idea, 5, project: @project)

      Tagging::Tag.create(title_multiloc: { en: 'Fish' })
      Tagging::Tag.create(title_multiloc: { en: 'Sea Lion' })
      Tagging::Tag.create(title_multiloc: { en: 'Dolphin' })
      @tagging = Tagging::Tag.create(title_multiloc: { en: 'Shark' })
      Tagging::Tagging.create(idea_id: @ideas[2].id, tag_id: @tagging.id, assignment_method: 'automatic')
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of tags per page'
    end
    parameter :search, 'Search entry', required: false

    example_request 'List all tags' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end

    example 'Search for tags' do
      t1 = Tagging::Tag.create(title_multiloc: { en: 'Avkdjsuz' })

      do_request search: 'Avkd'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq t1.id
    end

    example 'Get tags with idea ids' do
      @idea_ids = [@ideas[2].id]

      do_request idea_ids: @idea_ids
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq @tagging.id
    end

    example 'Get tags with project ids' do
      @projects = [@project.id]

      do_request projects: @projects
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq @tagging.id
    end
  end

  patch "web_api/v1/tags/:id" do
    parameter :title_multiloc, 'The new title', required: true

    let(:tag) { Tagging::Tag.create(title_multiloc: { en: 'Fish' }) }
    let(:id) { tag.id }
    let(:title_multiloc) { {'en' => "Comedy"} }


    example_request 'Update a tag' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
    end

  end
end
