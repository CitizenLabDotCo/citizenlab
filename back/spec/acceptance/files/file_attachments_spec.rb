# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'

resource 'FileAttachments' do
  header 'Content-Type', 'application/json'
  before { admin_header_token }

  get 'web_api/v1/file_attachments' do
    parameter :attachable_id, 'Filter by attachable id', required: false

    # TODO: test permissions
    let_it_be(:event) { create(:event) }
    let_it_be(:event_attachments) { create_pair(:file_attachment, attachable: event) }
    let_it_be(:project_attachment) { create(:file_attachment) }

    example_request 'List all file attachments' do
      assert_status 200
      expect(response_data.size).to eq(3)
    end

    example 'List all file attachments for a specific attachable', document: false do
      do_request(attachable_id: event.id)
      assert_status 200
      expect(response_ids).to match_array event_attachments.map(&:id)
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

  post 'web_api/v1/file_attachments' do
    let_it_be(:file) { create(:file) }
    let_it_be(:attachable) { create(:project) }

    with_options(scope: :file_attachment) do
      with_options required: true do
        parameter :file_id, 'ID of the file to attach'
        parameter :attachable_type, 'Type of the resource to attach the file to'
        parameter :attachable_id, 'ID of the resource to attach the file to'
      end

      parameter :position, 'Position of the file attachment'
    end

    let(:file_id) { file.id }
    let(:attachable_type) { 'Project' }
    let(:attachable_id) { attachable.id }
    let(:position) { 2 }

    example 'Create a file attachment' do
      expect { do_request }
        .to enqueue_job(LogActivityJob)
        .with(a_kind_of(Files::FileAttachment), 'created', anything, anything)

      assert_status 201

      expect(response_data).to match(
        id: anything,
        type: 'file_attachment',
        attributes: {
          position: 2,
          created_at: anything,
          updated_at: anything
        },
        relationships: {
          file: { data: { id: file.id, type: 'file' } },
          attachable: { data: { id: attachable.id, type: 'project' } }
        }
      )
    end
  end

  patch 'web_api/v1/file_attachments/:id' do
    with_options(scope: :file_attachment) do
      parameter :position, 'Position of the file attachment'
    end

    let_it_be(:file_attachment) { create(:file_attachment, position: 1) }

    let(:id) { file_attachment.id }
    let(:position) { 2 }

    example 'Update a file attachment' do
      expect { do_request }
        .to enqueue_job(LogActivityJob)
        .with(file_attachment, 'changed', anything, anything)

      assert_status 200
      expect(response_data.dig(:attributes, :position)).to eq(2)
      expect(file_attachment.reload.position).to eq(2)
    end
  end

  delete 'web_api/v1/file_attachments/:id' do
    let_it_be(:file_attachment) { create(:file_attachment) }

    let(:id) { file_attachment.id }

    example 'Delete a file attachment' do
      expect { do_request }.to have_enqueued_job(LogActivityJob)
      expect(response_status).to eq(200)
      expect { file_attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
