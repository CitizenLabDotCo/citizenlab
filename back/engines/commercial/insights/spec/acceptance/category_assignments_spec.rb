# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Inputs' do
  explanation 'Citizen inputs (only ideas for now) in the context of an Insights view.'

  before { header 'Content-Type', 'application/json' }

  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end

    context 'when normal user' do
      before { user_header_token }

      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end
  end

  shared_examples 'unprocessable entity' do
    context 'when name is empty' do
      let(:name) { '' }

      example_request 'returns unprocessable-entity error', document: false do
        expect(status).to eq(422)
      end
    end
  end

  post 'web_api/v1/insights/views/:view_id/inputs/:id/categories' do
    parameter :data, type: :array, items: {
      type: :object,
      required: %i[id type],
      properties: {
        id: { type: :string },
        type: { const: 'category' }
      }
    }

    let(:view) { create(:view) }
    let(:view_id) { view.id }

    let(:idea) { create(:idea, project: view.scope) }
    let(:id) { idea.id }

    context 'when admin' do
      before { admin_header_token }

      let(:categories) { create_list(:category, 2, view: view) }
      let(:data) do
        categories.map { |c| { id: c.id, type: 'category' } }
      end

      example_request 'assigns categories to an input' do
        expect(status).to eq(200)
        expect(json_response).to eq({ data: data })
        expect(Insights::CategoryAssignment.where(input: idea).pluck(:category_id))
          .to eq(categories.pluck(:id))
      end

      example 'ignores already assigned categories', document: false do
        Insights::CategoryAssignmentsService.new.add_assignments!(idea, [categories.first])
        do_request
        aggregate_failures 'check response' do
          expect(status).to eq(200)
          expect(json_response).to eq({ data: data })
        end
      end

      context 'when suggested categories includes the assigned categories' do
        before do
          assignment_service.add_suggestions(idea, categories)
        end

        let(:assignment_service) { Insights::CategoryAssignmentsService.new }
        let(:approved_category_ids) do
          assignment_service.approved_assignments(idea, view).pluck(:category_id)
        end

        example 'approves category assignments', document: false do
          do_request
          aggregate_failures 'check suggestions are converted into assignments' do
            expect(approved_category_ids).to match(categories.pluck(:id))
            expect(assignment_service.suggested_assignments(idea, view).count).to eq(0)
          end
        end
      end

      context 'when the input is out of view scope' do
        let(:idea) { create(:idea) }
        let(:id) { idea.id }

        # rubocop:disable RSpec/MultipleExpectations
        example 'returns 404', document: false do
          expect(idea.project).not_to eq(view.scope) # make sure the the idea is out of scope
          do_request
          expect(status).to eq(404)
        end
        # rubocop:enable RSpec/MultipleExpectations
      end

      context 'when categories belong to another view' do
        let(:categories) { [create(:category)] }

        example 'returns 404', document: false do
          do_request
          expect(status).to eq(404)
        end
      end
    end

    include_examples 'unauthorized requests'
  end
end
