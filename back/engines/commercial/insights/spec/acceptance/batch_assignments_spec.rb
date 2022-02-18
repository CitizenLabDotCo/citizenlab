# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Batch category assignments for view inputs' do
  before { header 'Content-Type', 'application/json' }

  let(:view) { create(:view) }
  let(:view_id) { view.id }

  let(:assignment_service) { Insights::CategoryAssignmentsService.new }
  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when normal user' do
      before { user_header_token }

      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end

  shared_examples 'not-found requests' do
    example "returns 404 if a category doesn't exist", document: false do
      do_request(inputs: [], categories: ['bad-uuid'])
      expect(status).to eq(404)
    end

    example "returns 404 if an input doesn't exist", document: false do
      do_request(inputs: ['bad-uuid'], categories: [])
      expect(status).to eq(404)
    end

    # Sanity check
    example 'does not return 404 with empty inputs & categories', document: false do
      do_request(inputs: [], categories: [])
      expect(status).to eq(204)
    end
  end

  post 'web_api/v1/insights/views/:view_id/batch/assign_categories' do
    parameter :inputs, 'An array of input identifiers', required: true
    parameter :categories, 'An array of category identifiers', required: true

    context 'when admin' do
      before { admin_header_token }

      # one input from each data source
      let(:input_instances) { view.source_projects.map { |p| create(:idea, project: p) } }
      let(:inputs) { input_instances.pluck(:id) }
      let(:category_instances) { create_list(:category, 2, view: view) }
      let(:categories) { category_instances.pluck(:id) }

      example_request 'assigns a set of categories to multiple inputs' do
        expect(status).to eq(204)

        inputs.each do |input_id|
          assignments = assignment_service.assignments(input_id, view)
          expect(assignments.pluck(:category_id)).to match_array categories
        end
      end

      example 'does not fail when categories were already assigned (idempotent)', document: false do
        assignment_service.add_assignments(input_instances.first, category_instances)

        do_request

        expect(status).to eq(204)
        inputs.each do |input_id|
          assignments = assignment_service.assignments(input_id, view)
          expect(assignments.pluck(:category_id)).to match_array categories
        end
      end

      include_examples 'not-found requests'
    end

    include_examples 'unauthorized requests'
  end

  post 'web_api/v1/insights/views/:view_id/batch/remove_categories' do
    parameter :inputs, 'An array of input identifiers', required: true
    parameter :categories, 'An array of category identifiers', required: true

    context 'when admin' do
      before { admin_header_token }

      before do
        assignment_service.add_assignments_batch(input_instances, category_instances)
      end

      # one input from each data source
      let(:input_instances) { view.source_projects.map { |p| create(:idea, project: p) } }
      let(:category_instances) { create_list(:category, 3, view: view) }

      # Removing only the two first categories for the two first ideas
      let(:inputs) { input_instances[0..1].pluck(:id) }
      let(:categories) { category_instances[0..1].pluck(:id) }

      example_request 'removes a set of categories from multiple inputs' do
        expect(status).to eq(204)

        aggregate_failures 'checking categories were removed' do
          inputs.each do |input_id|
            assignments = assignment_service.assignments(input_id, view)
            expect(assignments.pluck(:category_id)).to match_array [category_instances.last.id]
          end
        end

        # Checking categories were not removed from the last input.
        assignments = assignment_service.assignments(input_instances.last, view)
        expect(assignments.map(&:category)).to match_array category_instances
      end

      include_examples 'not-found requests'
    end

    include_examples 'unauthorized requests'
  end
end
