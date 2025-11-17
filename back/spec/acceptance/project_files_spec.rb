# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'File attachment as legacy ProjectFile' do
  explanation <<~EXPLANATION
    The implementation of this API has been updated to use the +Files:FileAttachment+
    model behind the scenes, instead of the legacy +ProjectFile+ model.
  EXPLANATION

  header 'Content-Type', 'application/json'

  before { admin_header_token }

  let_it_be(:project) { create(:project) }
  let(:project_id) { project.id }

  get 'web_api/v1/projects/:project_id/files' do
    example 'List the file attachments' do
      create_list(:file_attachment, 2, attachable: project)
      do_request
      assert_status 200
      expect(response_data.size).to eq 2
    end

    context 'when there are no file attachments' do
      example_request 'Returns an empty list' do
        assert_status 200
        expect(json_response_body[:data]).to be_empty
      end
    end
  end

  get 'web_api/v1/projects/:project_id/files/:id' do
    let!(:file_attachment) { create(:file_attachment, attachable: project) }
    let(:id) { file_attachment.id }

    example_request 'Get a file attachment by id' do
      assert_status 200

      expect(response_data).to match hash_including(
        id: id,
        type: 'file',
        attributes: hash_including(
          ordering: file_attachment.position,
          file: { url: file_attachment.file.content.url },
          name: file_attachment.file.name,
          size: file_attachment.file.size,
          created_at: file_attachment.file.created_at.iso8601(3),
          updated_at: file_attachment.file.updated_at.iso8601(3)
        )
      )
    end
  end

  patch 'web_api/v1/projects/:project_id/files/:id' do
    with_options scope: :file do
      parameter :ordering, 'An integer to update the order of the file attachments', required: false
    end

    example 'Update the ordering of a file attachment by id' do
      attachment1 = create(:file_attachment, attachable: project, position: 1)
      attachment2 = create(:file_attachment, attachable: project, position: 2)

      expect(attachment1.position).to eq(1)
      expect(attachment2.position).to eq(2)

      do_request(id: attachment2.id, ordering: 1)
      assert_status 200
      expect(response_data.dig(:attributes, :ordering)).to eq(1)

      # The front-end has full control over the ordering of file attachments which can
      # lead to inconsistencies. This will be reworked in the future.
      # See ticket TAN-5126.
      expect(attachment1.reload.position).to eq(1)
      expect(attachment2.reload.position).to eq(1)
    end
  end

  post 'web_api/v1/projects/:project_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :name, 'The name of the file, including the file extension', required: true
      parameter :ordering, 'An integer that is used to order the file attachments within a project', required: false
    end

    ValidationErrorHelper.new.error_fields(self, Files::File)

    let(:ordering) { 1 }
    let(:name) { 'minimal_pdf.pdf' }
    let(:file) { file_as_base64 name, 'application/pdf' }

    let!(:file_attachment) { create(:file_attachment, attachable: project, position: 1) }

    example 'Add a file to the project' do
      expect { do_request }
        .to change(Files::File, :count).by(1)
        .and(change(Files::FileAttachment, :count).by(1))
        .and(change(Files::FilesProject, :count).by(1))
        .and not_change(ProjectFile, :count)
        .and not_change(file_attachment.reload, :position)

      assert_status 201

      expect(response_data).to match hash_including(
        id: be_present,
        type: 'file',
        attributes: {
          ordering: ordering,
          file: { url: be_present },
          name: name,
          size: 130,
          created_at: be_present,
          updated_at: be_present
        }
      )

      attachment = Files::FileAttachment.find(response_data[:id])
      expect(attachment.file.projects).to contain_exactly(project)
    end

    # [TODO] Currently, the +Files::FileUploader+ allows all file extensions.
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

  delete 'web_api/v1/projects/:project_id/files/:id' do
    let!(:file_attachment) { create(:file_attachment, attachable: project) }
    let(:id) { file_attachment.id }

    example 'Delete a file attachment by id' do
      do_request(id: file_attachment.id)

      assert_status 200
      expect { file_attachment.file.reload }.not_to raise_error
      expect { file_attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
