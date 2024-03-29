# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Report layouts' do
  explanation 'Layout of customizable reports'

  header 'Content-Type', 'application/json'

  let_it_be(:report) { create(:report) }
  let_it_be(:report_id) { report.id }

  get 'web_api/v1/reports/:report_id/layout' do
    describe 'when authorized' do
      before { admin_header_token }

      example_request 'Get the layout of a report' do
        assert_status 200

        expect(response_data).to match(
          id: be_a(String),
          type: 'content_builder_layout',
          attributes: {
            enabled: true,
            code: 'report',
            created_at: be_a(String),
            updated_at: be_a(String),
            craftjs_json: {}
          }
        )
      end

      context 'when the report does not exist' do
        let(:report_id) { 'bad-report-id' }

        example_request 'returns 404 (Not Found)' do
          assert_status 404
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end
end
