# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'File attachment as legacy PhaseFile' do
  explanation <<~EXPLANATION
    The implementation of this API has been updated to use the +Files:FileAttachment+
    model behind the scenes, instead of the legacy +PhaseFile+ model.
  EXPLANATION

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @project = create(:project)
    @phase = create(:phase, project: @project)
    create_list(:file_attachment, 2, attachable: @phase)
  end

  get 'web_api/v1/phases/:phase_id/files' do
    let(:phase_id) { @phase.id }

    example_request 'List all file attachments of a phase' do
      assert_status 200
      expect(response_data.size).to eq 2
    end
  end

  get 'web_api/v1/phases/:phase_id/files/:file_id' do
    let(:phase_id) { @phase.id }
    let(:file_id) { @phase.file_attachments.first.id }

    example_request 'Get one file of a phase' do
      assert_status 200

      expect(response_data).to include(
        type: 'file',
        id: file_id,
        attributes: hash_including(
          file: hash_including(url: end_with('.pdf')),
          ordering: nil,
          name: be_a(String),
          size: be_an(Integer),
          created_at: be_a(String),
          updated_at: be_a(String)
        )
      )
    end
  end

  patch 'web_api/v1/phases/:phase_id/files/:file_id' do
    with_options scope: :file do
      parameter :ordering, 'An integer to update the order of the file attachments', required: false
    end

    let(:phase_id) { @phase.id }
    let(:file_id) { @phase.file_attachments.first.id }
    let(:ordering) { 3 }

    example_request 'Update the ordering of a file attachment' do
      assert_status 200
      expect(response_data.dig(:attributes, :ordering)).to eq(3)
    end
  end

  post 'web_api/v1/phases/:phase_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :name, 'The name of the file, including the file extension', required: true
      parameter :ordering, 'An integer that is used to order the file attachments within a phase', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Files::File)
    let(:phase_id) { @phase.id }
    let(:ordering) { 1 }
    let(:name) { 'afvalkalender.pdf' }
    let(:file) { file_as_base64 name, 'application/pdf' }

    example 'Add a file attachment to a phase' do
      expect { do_request }
        .to change(Files::File, :count).by(1)
        .and(change(Files::FileAttachment, :count).by(1))
        .and not_change(PhaseFile, :count)

      assert_status 201

      expect(response_data[:attributes]).to include(
        file: be_present,
        ordering: 1,
        name: name,
        size: be_present
      )
    end

    describe 'Add a file with an unsupported file extension', pending: <<~REASON do
      Currently, the +Files::FileUploader+ allows all file extensions.
    REASON
      let(:file) { file_as_base64 'keylogger.exe', 'application/octet-stream' }
      let(:name) { 'keylogger.exe' }

      example_request '[error]' do
        assert_status 422
        expect(json_response_body).to include_response_error(:file, 'extension_whitelist_error')
      end
    end

    describe 'Add a file that is too large' do
      example '[error]' do
        # Mock the `size_range` method of `Files::FileUploader` to set the maximum size to 3 bytes.
        expect_any_instance_of(Files::FileUploader).to receive(:size_range).and_return(1..3)

        do_request
        assert_status 422
        expect(json_response_body).to include_response_error(:file, 'max_size_error')
      end
    end
  end

  delete 'web_api/v1/phases/:phase_id/files/:file_id' do
    let(:phase_id) { @phase.id }
    let(:file_id) { @phase.file_attachments.first.id }

    example 'Delete file attachment from a phase' do
      expect { do_request }
        .to change(Files::FileAttachment, :count).by(-1)
        .and not_change(PhaseFile, :count)

      expect(response_status).to eq 200

      expect { Files::FileAttachment.find(file_id) }
        .to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
