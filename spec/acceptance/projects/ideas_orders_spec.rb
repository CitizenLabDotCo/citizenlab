# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects::IdeasOrder' do
  before do
    header 'Content-Type', 'application/json'
  end

  context 'As an admin' do
    before do
      admin_header_token
      create(:project_xl, ideas_order: '-new')
    end

    patch 'web_api/v1/projects/:project_id/ideas_order' do
      with_options scope: :project do
        parameter :ideas_order, 'The default order of ideas.'
      end

      let(:ideas_order) { 'new' }
      let(:project_id) { Project.first.id }
      let(:project) { Project.find(project_id) }

      example_request 'Update a project\'s order of Ideas to most recent' do
        expect(response_status).to eq 200

        ordered_ideas_ids = Idea.where(project: project).order_new.pluck(:id)

        response_idea_ids = json_parse(response_body).yield_self do |json|
          json.dig(:data, :relationships, :ideas, :data).map { |obj| obj[:id] }
        end

        expect(response_idea_ids).to eq ordered_ideas_ids
      end
    end
  end
end
