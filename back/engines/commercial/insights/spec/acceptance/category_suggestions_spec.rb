# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Category suggestions for view inputs' do
  before { header 'Content-Type', 'application/json' }

  let(:view) { create(:view) }
  let(:view_id) { view.id }
  let(:idea) { create(:idea, project: view.source_projects.first) }
  let(:input_id) { idea.id }

  let(:json_response) { json_parse(response_body) }
  let(:assignment_service) { Insights::CategoryAssignmentsService.new }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end

    context 'when normal user' do
      before { user_header_token }

      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end
  end

  delete 'web_api/v1/insights/views/:view_id/inputs/:input_id/suggested_categories' do
    context 'when admin' do
      before { admin_header_token }

      let(:categories) { create_list(:category, 2, view: view) }

      example 'deletes all suggested categories' do
        assignment_service.add_suggestions(idea, categories)
        expect { do_request }
          .to change { assignment_service.suggested_assignments(idea, view).count }.from(2).to(0)
        expect(status).to eq(200)
      end
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/insights/views/:view_id/inputs/:input_id/suggested_categories/:category_id' do

    context 'when admin' do
      before { admin_header_token }

      let(:category) { create(:category, view: view) }
      let(:category_id) { category.id }

      example 'discard a single suggestion' do
        assignment_service.add_suggestions(idea, [category])
        do_request
        expect(status).to eq(200)
        expect(assignment_service.suggested_assignments(idea, view)).to eq([])
      end
    end

    include_examples 'unauthorized requests'
  end
end
