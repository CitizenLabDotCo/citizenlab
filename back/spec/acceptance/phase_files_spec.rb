# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'PhaseFile' do
  explanation 'File attachments.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @project = create(:project)
    @phase = create(:phase, project: @project)
    create_list(:phase_file, 2, phase: @phase)
  end

  get 'web_api/v1/phases/:phase_id/files' do
    let(:phase_id) { @phase.id }

    example_request 'List all file attachments of a phase' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/phases/:phase_id/files/:file_id' do
    let(:phase_id) { @phase.id }
    let(:file_id) { PhaseFile.first.id }

    example_request 'Get one file of a phase' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :file)).to be_present
    end
  end

  post 'web_api/v1/phases/:phase_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :name, 'The name of the file, including the file extension', required: true
      parameter :ordering, 'An integer that is used to order the file attachments within a phase', required: false
    end
    ValidationErrorHelper.new.error_fields(self, PhaseFile)
    let(:phase_id) { @phase.id }
    let(:ordering) { 1 }
    let(:name) { 'afvalkalender.pdf' }
    let(:file) { file_as_base64 name, 'application/pdf' }

    example_request 'Add a file attachment to a phase' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :file)).to be_present
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(1)
      expect(json_response.dig(:data, :attributes, :name)).to eq(name)
      expect(json_response.dig(:data, :attributes, :size)).to be_present
    end

    describe do
      let(:file) { file_as_base64 'keylogger.exe', 'application/octet-stream' }
      let(:name) { 'keylogger.exe' }

      example_request '[error] Add an unsupported file extension as attachment to a phase' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:file, 'extension_whitelist_error')
      end
    end

    describe do
      example '[error] Add a file of which the size is too large' do
        # mock the size_range method of PhaseFileUploader to have 3 bytes as maximum size
        expect_any_instance_of(PhaseFileUploader).to receive(:size_range).and_return(1..3)

        do_request
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:file, 'max_size_error')
      end
    end
  end

  delete 'web_api/v1/phases/:phase_id/files/:file_id' do
    let(:phase_id) { @phase.id }
    let(:file_id) { PhaseFile.first.id }

    example_request 'Delete a file attachment from a phase' do
      expect(response_status).to eq 200
      expect { PhaseFile.find(file_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
