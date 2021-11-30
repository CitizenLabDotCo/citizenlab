# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Category-suggestion tasks' do

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

  before { header 'Content-Type', 'application/json' }

  let(:view) { create(:view) }
  let(:view_id) { view.id }

  get 'web_api/v1/insights/views/:view_id/tasks/category_suggestions' do
    route_description <<~DESC
      Get the list of ongoing category-suggestion tasks for a given list
      of categories or inputs. The list of inputs is not provided explicitly
      (list of identifiers), but via input filters.
    DESC

    parameter :categories, 'An array of category identifiers', required: false, type: :array, items: {type: :string}
    with_options scope: :inputs, required: false do
      parameter :categories, 'Filter inputs by categories (union)', type: :array, items: {type: :string}
      parameter :keywords, 'Filter inputs by keywords (identifiers of keyword nodes)', type: :array, items: {type: :string}
      parameter :processed, 'Filter inputs by processed status', type: :boolean
    end

    context 'when admin' do
      before { admin_header_token }

      let(:c1) { create(:category, view: view) }
      let(:c2) { create(:category, view: view) }

      let!(:tasks_c1) { create_list(:zsc_task, 2, categories: [c1]) }
      let!(:tasks_c2) { create_list(:zsc_task, 1, categories: [c2]) }
      let!(:other_task) { create(:zsc_task) } # task in another view

      example_request 'returns pending tasks' do
        expect(status).to eq(200)
        expected_tasks = tasks_c1 + tasks_c2
        expect(response_data.pluck(:id)).to match_array(expected_tasks.pluck(:id))
      end

      example 'returns pending tasks for a subset of categories', document: false do
        do_request(categories: [c1.id])
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to match_array(tasks_c1.pluck(:id))
      end

      example 'returns pending tasks for a subset of inputs', document: false do
        task_1, task_2 = [tasks_c1.first, tasks_c2.first]
        input_1, input_2 = create_list(:idea, 2, project: view.scope) # we need inputs that belong to the view
        create(:processed_flag, view: view, input: input_1)

        task_1.add_input(input_1)
        task_2.add_input(input_2)

        do_request(inputs: { processed: true })

        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to match_array([task_1.id])
      end
    end

    include_examples 'unauthorized requests'
  end

  post 'web_api/v1/insights/views/:view_id/tasks/category_suggestions' do
    route_description <<~DESC
      Create category-suggestion tasks for a given list of categories or inputs.
      The list of inputs is not provided explicitly (list of identifiers), but via
      input filters.
    DESC

    parameter :categories, 'An array of category identifiers', required: false, type: :array, items: {type: :string}
    with_options scope: :inputs, required: false do
      parameter :categories, 'Filter inputs by categories (union)', type: :array, items: {type: :string}
      parameter :keywords, 'Filter inputs by keywords (identifiers of keyword nodes)', type: :array, items: {type: :string}
      parameter :processed, 'Filter inputs by processed status', type: :boolean
    end

    context 'when admin' do
      before { admin_header_token }

      context "with the 'inputs' parameter" do
        example 'creates tasks only for the relevant inputs' do
          input_filter = { processed: false, keywords: ['keyword'] }

          expect(Insights::CreateClassificationTasksJob).to receive(:perform_now) do |view_arg, options|
            expect(view_arg).to eq(view)
            expect(options.fetch(:input_filter).to_h).to eq(input_filter.with_indifferent_access)
            expect(options.fetch(:categories)).to be_nil
          end

          do_request(inputs: input_filter)
          expect(status).to eq(202)
        end
      end

      context "with the 'categories' parameter" do
        example 'creates tasks only for specified categories', document: false do
          categories = create_list(:category, 2, view: view)
          category_ids = categories.pluck(:id)

          expect(Insights::CreateClassificationTasksJob).to receive(:perform_now) do |view_arg, options|
            expect(view_arg).to eq(view)
            expect(options.fetch(:categories)).to match_array(categories)
            expect(options.fetch(:input_filter)).to be_nil
          end

          do_request(categories: category_ids)
          expect(status).to eq(202)
        end
      end

      context 'without parameters' do
        example 'creates classification tasks for all inputs and categories', document: false do
          expect(Insights::CreateClassificationTasksJob).to receive(:perform_now) do |view_arg, options|
            expect(view_arg).to eq(view)
            expect(options.fetch(:input_filter)).to be_nil
            expect(options.fetch(:categories)).to be_nil
          end

          do_request
          expect(status).to eq(202)
        end
      end
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/insights/views/:view_id/tasks/category_suggestions' do
    context 'when admin' do
      before do
        admin_header_token
        create_list(:zsc_task, 2, categories: [create(:category, view: view)])
        create(:zsc_task)
      end

      example 'deletes all the tasks (of the view)' do
        expect { do_request }.to change(Insights::ZeroshotClassificationTask, :count).from(3).to(1)
        expect(status).to eq(200)
      end
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/insights/views/:view_id/tasks/category_suggestions/:task_id' do
    context 'when admin' do
      before { admin_header_token }

      example 'deletes a task' do
        task = create(:zsc_task, categories: [create(:category, view: view)])
        do_request(task_id: task.id)
        expect(status).to eq(200)
        expect { task.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      example "returns 404 if the task doesn't belong to the view" do
        do_request(task_id: create(:zsc_task).id)
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end
end
