# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Power BI templates' do
  explanation 'Download the two power BI templates - admin only'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/power_bi_templates/:id' do
    let(:id) { 'dataflow' }

    context 'as an admin' do
      before { admin_header_token }

      example_request 'Dataflow template' do
        assert_status 200
      end
    end

    context 'as a normal user' do
      before { header_token_for create(:user) }

      example_request 'Unauthorised dataflow template' do
        assert_status 401
      end
    end

    context 'as a public user' do
      example_request 'Unauthorised dataflow template' do
        assert_status 401
      end
    end
  end
end
