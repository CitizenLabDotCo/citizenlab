# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Category-suggestion tasks' do
  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/insights/views/:view_id/tasks/category_suggestions' do
    parameter :inputs, 'An array of input identifiers'
    parameter :categories, 'An array of category identifiers'

    let(:view) { create(:view) }

    let(:view_id) { view.id }

    context 'when admin' do
      before { admin_header_token }

      context 'with parameters' do
        before do
          create_list(:category, 2, view: view)
          create_list(:idea, 3, project: view.scope)
        end

        let(:categories) { view.categories.take(1).pluck(:id) }
        let(:inputs) { view.scope.ideas.take(2).pluck(:id) }

        example 'enqueues task-creation job' do
          expect { do_request }.to(have_enqueued_job.with do |options|
            expect(options.fetch(:inputs).pluck(:id)).to match(inputs)
            expect(options.fetch(:categories).pluck(:id)).to match(categories)
            expect(options[:view]).to eq(view)
          end)
          expect(status).to eq(202)
        end
      end

      example 'enqueues task-creation job', document: false do
        expect { do_request }.to(have_enqueued_job(Insights::CreateClassificationTasksJob).with do |options|
          expect(options.fetch(:inputs)).to be_nil
          expect(options.fetch(:categories)).to be_nil
          expect(options[:view]).to eq(view)
        end)
        expect(status).to eq(202)
      end
    end
  end
end
