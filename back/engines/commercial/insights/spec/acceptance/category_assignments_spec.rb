# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Category suggestions for view inputs' do
  before { header 'Content-Type', 'application/json' }

  let(:view) { create(:view) }
  let(:view_id) { view.id }
  let(:idea) { create(:idea, project: view.scope) }
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

  post 'web_api/v1/insights/views/:view_id/inputs/:input_id/categories' do
    parameter :data, type: :array, items: {
      type: :object,
      required: %i[id type],
      properties: {
        id: { type: :string },
        type: { const: 'category' }
      }
    }

    context 'when admin' do
      before { admin_header_token }

      let(:categories) { create_list(:category, 2, view: view) }
      let(:data) do
        categories.map { |c| { id: c.id, type: 'category' } }
      end

      example_request 'assigns categories to an input and sets processed flag' do
        expect(status).to eq(200)
        expect(json_response).to eq({ data: data })
        expect(assignment_service.approved_assignments(idea, view).pluck(:category_id))
          .to eq(categories.pluck(:id))
        expect(idea.processed(view)).to eq(true)
      end

      example 'ignores already assigned categories but sets processed flag', document: false do
        assignment_service.add_assignments(idea, [categories.first])
        do_request
        aggregate_failures 'check response' do
          expect(status).to eq(200)
          expect(json_response).to eq({ data: data })
          expect(idea.processed(view)).to eq(true)
        end
      end

      context 'when suggested categories includes the assigned categories' do
        before do
          assignment_service.add_suggestions(idea, categories)
        end

        let(:approved_category_ids) do
          assignment_service.approved_assignments(idea, view).pluck(:category_id)
        end

        example 'approves category assignments and sets the flag', document: false do
          do_request
          aggregate_failures 'check suggestions are converted into assignments' do
            expect(status).to eq(200)
            expect(approved_category_ids).to match(categories.pluck(:id))
            expect(assignment_service.suggested_assignments(idea, view).count).to eq(0)
            expect(idea.processed(view)).to eq(true)
          end
        end
      end

      context 'when the input is out of view scope' do
        let(:idea) { create(:idea) }
        let(:input_id) { idea.id }

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

  delete 'web_api/v1/insights/views/:view_id/inputs/:input_id/categories' do
    context 'when admin' do
      before { admin_header_token }

      let(:categories) { create_list(:category, 2, view: view) }

      example 'deletes all category assignments but doesn\'t change the flag' do
        assignment_service.add_assignments(idea, categories, false)
        expect(idea.processed(view)).to eq(false)
        expect { do_request }
          .to change { assignment_service.approved_assignments(idea, view).count }.from(2).to(0)
        expect(status).to eq(200)
        expect(idea.processed(view)).to eq(false)
      end

      example 'does not delete suggestions', document: false do
        assignment_service.add_suggestions(idea, categories)
        expect { do_request }.not_to(change { assignment_service.approved_assignments(idea, view).count })
        expect(status).to eq(200)
      end
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/insights/views/:view_id/inputs/:input_id/categories/:category_id' do

    context 'when admin' do
      before { admin_header_token }

      let(:category) { create(:category, view: view) }
      let(:category_id) { category.id }

      example 'delete a category assignment' do
        assignment_service.add_assignments(idea, [category])
        do_request
        expect(status).to eq(200)
        expect(assignment_service.approved_assignments(idea, view)).to eq([])
      end
    end

    include_examples 'unauthorized requests'
  end
end
