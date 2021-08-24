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
    parameter :inputs, 'An array of input identifiers'
    parameter :categories, 'An array of category identifiers'

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
        expect(json_response_body[:data].pluck(:id)).to match_array(expected_tasks.pluck(:id))
      end

      example 'returns pending tasks for a subset of categories', document: false do
        do_request(categories: [c1.id])
        expect(status).to eq(200)
        expect(json_response_body[:data].pluck(:id)).to match_array(tasks_c1.pluck(:id))
      end

      example 'returns pending tasks for a subset of inputs', document: false do
        task_1, task_2 = expected_tasks = [tasks_c1.first, tasks_c2.first]
        input_1, input_2 = inputs = create_list(:idea, 2, project: view.scope) # we need inputs that belong to the view

        task_1.add_input(input_1)
        task_2.add_input(input_2)

        do_request(inputs: inputs.pluck(:id))

        expect(status).to eq(200)
        expect(json_response_body[:data].pluck(:id)).to match_array(expected_tasks.pluck(:id))
      end

      example 'returns 404 for inputs that does not belong the view scope' do
        do_request(inputs: [other_task.inputs.first.id])
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end

  post 'web_api/v1/insights/views/:view_id/tasks/category_suggestions' do
    parameter :inputs, 'An array of input identifiers'
    parameter :categories, 'An array of category identifiers'

    context 'when admin' do
      before { admin_header_token }

      context 'with parameters' do
        before do
          create_list(:category, 2, view: view)
          create_list(:idea, 3, project: view.scope)
        end

        let(:categories) { view.categories.take(1).pluck(:id) }
        let(:inputs) { view.scope.ideas.take(2).pluck(:id) }

        example 'creates classification tasks' do
          expect(Insights::CreateClassificationTasksJob).to receive(:perform_now) do |options|
            expect(options.fetch(:inputs).pluck(:id)).to match_array(inputs)
            expect(options.fetch(:categories).pluck(:id)).to match_array(categories)
            expect(options[:view]).to eq(view)
          end

          do_request

          expect(status).to eq(202)
        end

        example 'returns 404 if the category belongs to another view', document: false do
          do_request(categories: create(:category).id)
          expect(status).to eq(404)
        end

        example "returns 404 if the input doesn't belong to the view scope", document: false do
          do_request(inputs: create(:idea).id)
          expect(status).to eq(404)
        end
      end

      example 'creates classification tasks', document: false do
        expect(Insights::CreateClassificationTasksJob).to receive(:perform_now) do |options|
          expect(options.fetch(:inputs)).to be_nil
          expect(options.fetch(:categories)).to be_nil
          expect(options[:view]).to eq(view)
        end

        do_request

        expect(status).to eq(202)
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
