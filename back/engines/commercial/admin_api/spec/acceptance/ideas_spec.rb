# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea', admin_api: true do
  before do
    header 'Content-Type', 'application/json'
    header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')
  end

  let(:idea) { create(:idea_with_topics) }
  let(:idea_id) { idea.id }

  get 'admin_api/ideas' do
    parameter :sort, 'Sort order: trending, popular, or new', required: false
    parameter :projects, 'Filter by project IDs', required: false
    parameter :topics, 'Filter by topic IDs', required: false
    parameter :limit, 'Maximum number of ideas to return', required: false

    before do
      header 'tenant', Tenant.current.id

      @project = create(:project)
      @idea_old = create(:idea, project: @project, publication_status: 'published', published_at: 3.days.ago)
      @idea_mid = create(:idea, project: @project, publication_status: 'published', published_at: 2.days.ago)
      @idea_new = create(:idea, project: @project, publication_status: 'published', published_at: 1.day.ago)
      create(:idea_image, idea: @idea_new)
      create(:idea, publication_status: 'draft') # should not appear
    end

    example_request 'List public ideas' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:ideas].size).to eq 3
    end

    example 'List ideas sorted by newest' do
      do_request(sort: 'new')
      expect(status).to eq 200
      json_response = json_parse(response_body)
      ids = json_response[:ideas].pluck(:id)
      expect(ids).to eq [@idea_new.id, @idea_mid.id, @idea_old.id]
    end

    example 'Filter ideas by project' do
      other_project = create(:project)
      create(:idea, project: other_project, publication_status: 'published')

      do_request(projects: [@project.id])
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:ideas].size).to eq 3
      expect(json_response[:ideas].pluck(:project_id)).to all(eq(@project.id))
    end

    example 'Limit the number of ideas' do
      do_request(limit: 2)
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:ideas].size).to eq 2
    end

    example 'Ideas include images' do
      do_request
      expect(status).to eq 200
      json_response = json_parse(response_body)
      idea_with_image = json_response[:ideas].find { |i| i[:id] == @idea_new.id }
      expect(idea_with_image[:idea_images]).to be_present
      expect(idea_with_image[:idea_images].first[:versions]).to be_a(Hash)
    end
  end

  get 'admin_api/ideas/:idea_id' do
    example_request 'Find an idea by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:idea][:id]).to eq idea_id
      expect(json_response[:idea][:title_multiloc].stringify_keys).to eq idea.title_multiloc
      expect(json_response[:idea][:body_multiloc].stringify_keys).to eq idea.body_multiloc
      expect(json_response[:idea][:input_topics].pluck(:id)).to match_array(idea.input_topic_ids)
      expect(json_response[:idea][:author][:id]).to eq idea.author_id
    end
  end
end
