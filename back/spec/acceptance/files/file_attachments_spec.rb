# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'

resource 'FileAttachments' do
  header 'Content-Type', 'application/json'
  before { admin_header_token }

  get 'web_api/v1/file_attachments' do
    let!(:file_attachment1) { create(:file_attachment, position: 1) }
    let!(:file_attachment2) { create(:file_attachment, position: 2) }

    example_request 'List all file attachments' do
      assert_status 200

      expect(response_data.size).to eq 2
      expect(response_data.first).to match(
        id: file_attachment1.id,
        type: 'file_attachment',
        attributes: {
          position: file_attachment1.position,
          created_at: anything,
          updated_at: anything
        },
        relationships: {
          file: { data: { id: file_attachment1.file.id, type: 'file' } },
          attachable: { data: { id: file_attachment1.attachable_id, type: 'project' } }
        }
      )
    end
  end

  get 'web_api/v1/file_attachments/:id' do
    let(:file_attachment) { create(:file_attachment) }

    let(:id) { file_attachment.id }

    example_request 'Get a file attachment by id' do
      assert_status 200

      expect(response_data).to match(
        id: file_attachment.id,
        type: 'file_attachment',
        attributes: {
          position: file_attachment.position,
          created_at: anything,
          updated_at: anything
        },
        relationships: {
          file: { data: { id: file_attachment.file.id, type: 'file' } },
          attachable: { data: { id: file_attachment.attachable_id, type: 'project' } }
        }
      )
    end
  end

  delete 'web_api/v1/file_attachments/:id' do
    let_it_be(:file_attachment) { create(:file_attachment) }

    let(:id) { file_attachment.id }

    example_request 'Delete a file attachment' do
      puts "Making DELETE request to: /web_api/v1/file_attachments/#{id}"
      puts "File attachment exists before request: #{Files::FileAttachment.exists?(id)}"

      do_request

      puts "Response status: #{response_status}"
      puts "Response body: #{response_body}"
      puts "File attachment exists after request: #{Files::FileAttachment.exists?(id)}"

      expect(response_status).to eq(200)
      expect { Files::FileAttachment.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
