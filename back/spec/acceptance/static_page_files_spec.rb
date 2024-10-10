# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'StaticPageFile' do
  explanation 'StaticPage attachments.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @page = create(:static_page)
    create_list(:static_page_file, 2, static_page: @page)
  end

  get 'web_api/v1/static_pages/:page_id/files' do
    let(:page_id) { @page.id }

    example_request 'List all file attachments of a static page' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/static_pages/:page_id/files/:file_id' do
    let(:page_id) { @page.id }
    let(:file_id) { StaticPageFile.first.id }

    example_request 'Get one file of a static page' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :attributes, :file)).to be_present
    end
  end

  patch 'web_api/v1/static_pages/:page_id/files/:file_id' do
    with_options scope: :file do
      parameter :ordering, 'An integer to update the order of the file attachments', required: false
    end

    let(:page_id) { @page.id }
    let(:file_id) { StaticPageFile.first.id }
    let(:ordering) { 3 }

    example_request 'Update the ordering of a file attachment' do
      do_request(ordering: ordering)
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(3)
    end
  end

  post 'web_api/v1/static_pages/:page_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :ordering, 'An integer that is used to order the file attachments within a page', required: false
      parameter :name, 'The name of the file, including the file extension', required: true
    end
    ValidationErrorHelper.new.error_fields self, StaticPageFile
    let(:page_id) { @page.id }
    let(:ordering) { 1 }
    let(:name) { 'afvalkalender.pdf' }
    let(:file) { file_as_base64 name, 'application/pdf' }

    example_request 'Add a file attachment to a page' do
      assert_status 201
      json_response = json_parse response_body
      expect(json_response.dig(:data, :attributes, :file)).to be_present
      expect(json_response.dig(:data, :attributes, :ordering)).to eq 1
      expect(json_response.dig(:data, :attributes, :name)).to eq name
      expect(json_response.dig(:data, :attributes, :size)).to be_present
    end

    describe do
      let(:name) { 'keylogger.exe' }
      let(:file) { file_as_base64 name, 'application/octet-stream' }

      example_request '[error] Add an unsupported file extension as attachment to a page' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:file, 'extension_whitelist_error')
      end
    end

    describe do
      example '[error] Add a file of which the size is too large' do
        # mock the size_range method of StaticPageFileUploader to have 3 bytes as maximum size
        expect_any_instance_of(StaticPageFileUploader).to receive(:size_range).and_return(1..3)

        do_request
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:file, 'max_size_error')
      end
    end
  end

  delete 'web_api/v1/static_pages/:page_id/files/:file_id' do
    let(:page_id) { @page.id }
    let(:file_id) { StaticPageFile.first.id }

    example_request 'Delete a file attachment from a page' do
      expect(response_status).to eq 200
      expect { StaticPageFile.find file_id }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
