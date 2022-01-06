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

  # In summary, we set up a view with 2 categories and 3 tasks
  # (2 tasks with category 1 and 1 task with category 2), and
  # another task not related to that view
  let_it_be(:view) { create(:view) }
  let_it_be(:view_id) { view.id }
  let_it_be(:c1) { create(:category, view: view) }
  let_it_be(:c2) { create(:category, view: view) }
  let_it_be(:tasks_c1) { create_list(:zsc_task, 2, categories: [c1]) }
  let_it_be(:tasks_c2) { create_list(:zsc_task, 1, categories: [c2]) }
  let_it_be(:another_task) { create(:zsc_task) } # task in another view

  def self.parameter_categories
    parameter(
      :categories, 'An array of category identifiers',
      required: false,
      type: :array, items: { type: :string }
    )
  end

  def self.parameters_input_filters
    with_options scope: :inputs, required: false do
      parameter :categories, 'Filter inputs by categories (union)', type: :array, items: { type: :string }
      parameter :keywords, 'Filter inputs by keywords (identifiers of keyword nodes)', type: :array, items: { type: :string }
      parameter :processed, 'Filter inputs by processed status', type: :boolean
    end
  end

  get 'web_api/v1/insights/views/:view_id/tasks/category_suggestions' do
    route_description <<~DESC
      Get the list of ongoing category-suggestion tasks for a given list
      of categories or inputs. The list of inputs is not provided explicitly
      (list of identifiers), but via input filters.
    DESC

    parameter_categories
    parameters_input_filters

    context 'when admin' do
      before { admin_header_token }

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
        task = tasks_c1.first
        create(:processed_flag, view: view, input: task.inputs.first)

        do_request(inputs: { processed: true })

        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to match_array([task.id])
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/insights/views/:view_id/stats/tasks/category_suggestions' do
    route_description <<~DESC
      Get the count of ongoing category-suggestion tasks for a given list
      of categories or inputs. The list of inputs is not provided explicitly
      (list of identifiers), but via input filters.
    DESC

    parameter_categories
    parameters_input_filters

    context 'when admin' do
      before { admin_header_token }

      example_request 'returns the number of tasks' do
        expect(status).to eq(200)
        expect(json_response_body[:count]).to eq(tasks_c1.count + tasks_c2.count)
      end

      example 'returns the number of tasks for a subset of categories', document: false do
        do_request(categories: [c1.id])
        expect(status).to eq(200)
        expect(json_response_body[:count]).to eq(tasks_c1.count)
      end

      example 'returns the number of tasks for a subset of inputs', document: false do
        task = tasks_c1.first
        create(:processed_flag, view: view, input: task.inputs.first)

        do_request(inputs: { processed: true })

        expect(status).to eq(200)
        expect(json_response_body[:count]).to eq(1)
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

    parameter_categories
    parameters_input_filters

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
    route_description <<~DESC
      Cancel ongoing category-suggestion tasks for a given list
      of categories or inputs. The list of inputs is not provided explicitly
      (list of identifiers), but via input filters.
    DESC

    parameter_categories
    parameters_input_filters

    context 'when admin' do
      before do
        admin_header_token

        response = instance_double(HTTParty::Response, code: 200)
        allow_any_instance_of(NLP::Api).to receive(:cancel_tasks).and_return(response)
      end

      example 'deletes the tasks of a category' do
        task_ids = tasks_c1.pluck(:task_id)
        expect_any_instance_of(NLP::Api)
          .to receive(:cancel_tasks).with(match_array(task_ids))

        expect { do_request(categories: [c1.id]) }
          .to change(Insights::ZeroshotClassificationTask, :count).by(-tasks_c1.size)

        expect(status).to eq(200)
        aggregate_failures 'check task records are deleted' do
          tasks_c1.each do |task|
            expect { task.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end
      end

      example 'deletes tasks associated with processed inputs', document: false do
        task = tasks_c1.first
        input = task.inputs.first
        create(:processed_flag, view: view, input: input)

        expect_any_instance_of(NLP::Api).to receive(:cancel_tasks).with([task.task_id])

        do_request({ inputs: { processed: 'true' } })

        expect(status).to eq(200)
        expect { task.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    include_examples 'unauthorized requests'
  end
end
