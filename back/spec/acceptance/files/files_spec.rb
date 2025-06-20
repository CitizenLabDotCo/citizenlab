# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'

resource 'Files' do
  get 'web_api/v1/files' do
    let_it_be(:files) { create_list(:file, 2) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all files' do
        assert_status 200
        expect(response_data.size).to eq 2
      end
    end

    context 'when normal user' do
      before { header_token_for create(:user) }

      example 'Returns an empty list of files', document: false do
        do_request
        assert_status 200
        expect(response_data.size).to eq 0
      end
    end
  end

  get 'web_api/v1/files/:id' do
    let_it_be(:file) { create(:file) }

    let(:id) { file.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get one file' do
        assert_status 200

        expect(response_data).to include(
          id: file.id,
          type: 'file',
          attributes: {
            name: file.name,
            created_at: file.created_at.iso8601(3),
            updated_at: file.updated_at.iso8601(3)
          },
          relationships: {
            uploader: {
              data: { id: file.uploader_id, type: 'user' }
            }
          }
        )
      end
    end

    context 'when normal user' do
      before { header_token_for create(:user) }

      include_examples 'unauthorized'
    end
  end
end
