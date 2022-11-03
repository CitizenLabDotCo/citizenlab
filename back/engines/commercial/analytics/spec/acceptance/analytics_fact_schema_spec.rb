# frozen_string_literal: true

# Tests for fact table schemas

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - Fact tables' do
  explanation 'Schema for each fact table.'

  context 'when admin' do
    before do
      header 'Content-Type', 'application/json'
      admin_header_token
    end

    get 'web_api/v1/analytics/schema/:fact' do
      describe 'Post' do
        let(:fact) { 'post' }

        example_request 'Returns Post Fact attributes and dimensions' do
          expect(status).to eq(200)
        end
      end

      describe 'Participation' do
        let(:fact) { 'participation' }

        example_request 'Returns Participation Fact attributes and dimensions' do
          expect(status).to eq(200)
        end
      end

      describe 'Visit' do
        let(:fact) { 'visit' }

        example_request 'Returns Visit Fact attributes and dimensions' do
          expect(status).to eq(200)
        end
      end

      describe 'Registration' do
        let(:fact) { 'registration' }

        example_request 'Returns Registration Fact attributes and dimensions' do
          expect(status).to eq(200)
        end
      end

      describe 'Unknown fact table' do
        let(:fact) { 'xxxxx' }

        example_request 'Returns bad request' do
          expect(status).to eq(400)
        end
      end
    end
  end

  context 'When not admin' do
    get 'web_api/v1/analytics/schema/:fact' do
      let(:fact) { 'post' }
      example_request 'returns 401 (unauthorized)' do
        assert_status 401
      end
    end
  end
end
