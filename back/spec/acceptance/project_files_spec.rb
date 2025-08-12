# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ProjectFile' do
  explanation 'File attachments.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @project = create(:project)
    create_list(:project_file, 2, project: @project)
  end

  get 'web_api/v1/projects/:project_id/files' do
    let(:project_id) { @project.id }

    example_request 'List all file attachments of a project' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/projects/:project_id/files/:file_id' do
    let(:project_id) { @project.id }
    let(:file_id) { ProjectFile.first.id }

    example_request 'Get one file of a project' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :file)).to be_present
    end
  end

  patch 'web_api/v1/projects/:project_id/files/:file_id' do
    with_options scope: :file do
      parameter :ordering, 'An integer to update the order of the file attachments', required: false
    end

    let(:project_id) { @project.id }
    let(:file_id) { ProjectFile.first.id }
    let(:ordering) { 3 }

    example_request 'Update the ordering of a file attachment' do
      do_request(ordering: ordering)
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(3)
    end
  end

  post 'web_api/v1/projects/:project_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :name, 'The name of the file, including the file extension', required: true
      parameter :ordering, 'An integer that is used to order the file attachments within a project', required: false
    end
    ValidationErrorHelper.new.error_fields(self, ProjectFile)
    let(:project_id) { @project.id }
    let(:ordering) { 1 }
    let(:name) { 'afvalkalender.pdf' }
    let(:file) { file_as_base64 name, 'application/pdf' }

    example_request 'Add a file attachment to a project' do
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

      example_request '[error] Add an unsupported file extension as attachment to a project' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:file, 'extension_whitelist_error')
      end
    end

    describe do
      example '[error] Add a file of which the size is too large' do
        # mock the size_range method of ProjectFileUploader to have 3 bytes as maximum size
        expect_any_instance_of(ProjectFileUploader).to receive(:size_range).and_return(1..3)

        do_request
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:file, 'max_size_error')
      end
    end
  end

  delete 'web_api/v1/projects/:project_id/files/:file_id' do
    let(:project_id) { @project.id }
    let(:file_id) { ProjectFile.first.id }

    example_request 'Delete a file attachment from a project' do
      expect(response_status).to eq 200
      expect { ProjectFile.find(file_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  get 'web_api/v1/projects/:project_id/files' do
    parameter :project_id, 'Project ID', required: true
    let(:project) { create(:project) }
    let(:project_id) { project.id }

    context 'when CONSTANTIZER search returns no legacy files but file attachments exist' do
      let!(:file) { create(:file, name: 'test-attachment.pdf', projects: [project]) }
      let!(:file_attachment) { create(:file_attachment, attachable: project, file: file) }

      example_request 'Returns file attachments with exact same JSON structure as legacy files' do
        assert_status 200
        json_response = json_parse(response_body)

        expect(json_response[:data].size).to eq(1)

        # Verify JSON API format
        file_data = json_response[:data][0]
        expect(file_data[:type]).to eq('file')
        expect(file_data[:id]).to be_present

        # Verify all required attributes are present
        attributes = file_data[:attributes]
        expect(attributes).to have_key(:file)
        expect(attributes).to have_key(:ordering)
        expect(attributes).to have_key(:name)
        expect(attributes).to have_key(:size)
        expect(attributes).to have_key(:created_at)
        expect(attributes).to have_key(:updated_at)

        # Verify attribute values and types
        expect(attributes[:name]).to eq('test-attachment.pdf')
        expect(attributes[:ordering]).to be_nil
        expect(attributes[:size]).to be_a(Integer)
        expect(attributes[:created_at]).to be_a(String)
        expect(attributes[:updated_at]).to be_a(String)

        # Verify file attribute structure (should contain url)
        expect(attributes[:file]).to be_a(Hash)
        expect(attributes[:file]).to have_key(:url)
        expect(attributes[:file][:url]).to be_a(String)
        expect(attributes[:file][:url]).to include('.pdf')
      end
    end

    context 'when both CONSTANTIZER and file attachments have files' do
      let!(:project_file) { create(:project_file, project: project) }
      let!(:file) { create(:file, name: 'test-attachment.pdf', projects: [project]) }
      let!(:file_attachment) { create(:file_attachment, file: file, attachable: project) }

      example_request 'Prioritizes CONSTANTIZER results over file attachments' do
        assert_status 200
        json_response = json_parse(response_body)

        expect(json_response[:data].size).to eq(1)

        # Should return CONSTANTIZER result, not file attachment
        expect(json_response[:data][0][:id]).to eq(project_file.id)
      end
    end

    context 'when neither CONSTANTIZER nor file attachments return results' do
      example_request 'Returns empty results' do
        assert_status 200
        json_response = json_parse(response_body)

        expect(json_response[:data]).to be_empty
      end
    end
  end
end
