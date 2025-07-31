# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'File Previews' do
  header 'Content-Type', 'application/json'
  let(:file_preview) { create(:file_preview) }
  let(:id) { file_preview.file.id }

  get 'web_api/v1/files/:id/preview' do
    context 'when admin' do
      before { admin_header_token }

      example_request 'Get a file preview' do
        assert_status 200
        expect(response_data[:attributes]).to include(
          status: 'pending',
          content: { url: kind_of(String) }
        )
      end
    end

    context 'when normal user' do
      before { header_token_for create(:user) }

      example_request '[error] Get a file preview' do
        assert_status 401
      end
    end
  end
end
