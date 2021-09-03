# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Text-network-analysis tasks' do

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

  get 'web_api/v1/insights/views/:view_id/tasks/text_network_analysis' do
    context 'when admin' do
      before { admin_header_token }

      context "when there are pending tasks" do
        before { create_list(:tna_task_view, 2, view: view) }

        example_request 'returns the tasks' do
          expect(status).to eq(200)
          expect(response_data.length).to eq(2)
        end
      end

      context "when there is no pending tasks" do
        example 'returns an empty list', document: false do
          do_request
          expect(status).to eq(200)
          expect(response_data).to be_empty
        end
      end

    end

    include_examples 'unauthorized requests'
  end
end
