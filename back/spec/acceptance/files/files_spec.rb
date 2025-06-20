# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

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
end
