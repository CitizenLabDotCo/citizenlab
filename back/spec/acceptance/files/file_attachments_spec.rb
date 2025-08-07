# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'

resource 'FileAttachments' do
  header 'Content-Type', 'application/json'
  before { admin_header_token }

  let_it_be(:project) { create(:project) }
  let(:project_id) { project.id }

  get 'web_api/v1/projects/:project_id/files' do
    let_it_be(:file_attachment) { create_pair(:file_attachment, attachable: project) }

    context 'when there are legacy files' do
      let!(:legacy_file) { create(:project_file, project: project) }

      example_request 'List only the legacy files' do
        assert_status 200
        expect(response_data.size).to eq(1)
        expect(response_ids).to eq [legacy_file.id]
      end
    end

    context 'when there are only file attachments' do
      example 'List the file attachments' do
        do_request
        assert_status 200
        expect(response_data.size).to eq(2)
        expect(response_ids).to match_array file_attachment.map(&:id)
      end
    end

    context 'when there are legacy files marked as migrated' do
      let!(:legacy_file) { create(:project_file, project: project, migrated_file: create(:file)) }

      example_request 'List the file attachments' do
        assert_status 200
        expect(response_data.size).to eq(2)
        expect(response_ids).to match_array file_attachment.map(&:id)
      end
    end
  end

  get 'web_api/v1/projects/:project_id/files/:id' do
    let_it_be(:file_attachment) { create(:file_attachment, attachable: project) }
    let_it_be(:legacy_file) { create(:project_file, project: project) }

    let(:project_id) { project.id }
    let(:id) { file_attachment.id }

    example 'Get a file attachment by id' do
      do_request(id: file_attachment.id)
      assert_status 200

      expect(response_data).to match hash_including(
        id: file_attachment.id,
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

    example 'Get a legacy file by id' do
      do_request(id: legacy_file.id)
      assert_status 200
      expect(response_data[:id]).to eq(legacy_file.id)
    end

    context 'when the legacy file is migrated' do
      example 'Get a migrated legacy file by id [NOT FOUND]' do
        migrated_file = create(:project_file, project: project, migrated_file: create(:file))
        do_request(id: migrated_file.id)
        assert_status 404
      end
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

    example 'Update the ordering of a legacy file by id' do
      # We only need one file to test reordering because the backend does not manage
      # ordering for legacy files. The value can be set arbitrarily by the frontend.
      file = create(:project_file, project: project, ordering: 1)
      # This should not be taken into account. In principle, file attachments and legacy
      # files should not be mixed, but we're testing it anyway.
      attachment = create(:file_attachment, attachable: project, position: 1)

      do_request(id: file.id, ordering: 2)
      assert_status 200
      expect(response_data.dig(:attributes, :ordering)).to eq(2)

      expect(file.reload.ordering).to eq(2)
      expect(attachment.reload.position).to eq(1)
    end
  end

  delete 'web_api/v1/projects/:project_id/files/:id' do
    let_it_be(:file_attachment) { create(:file_attachment, attachable: project) }
    let_it_be(:legacy_file) { create(:project_file, project: project) }

    context 'when this is the only attachment of the file' do
      example 'Delete a file attachment by id (and the file)' do
        do_request(id: file_attachment.id)

        assert_status 200
        expect { file_attachment.file.reload }.to raise_error(ActiveRecord::RecordNotFound)
        expect { file_attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when there are other attachments of the file' do
      let!(:other_attachment) { create(:file_attachment, file: file_attachment.file) }

      example 'Delete a file attachment by id' do
        do_request(id: file_attachment.id)

        assert_status 200
        expect { file_attachment.file.reload }.not_to raise_error
        expect { file_attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    example 'Delete a legacy file by id' do
      do_request(id: legacy_file.id)
      assert_status 200
      expect { ProjectFile.find(legacy_file.id) }
        .to raise_error(ActiveRecord::RecordNotFound)
    end

    context 'when the legacy file is migrated' do
      example 'Delete a migrated legacy file by id [NOT FOUND]' do
        migrated_file = create(:project_file, project: project, migrated_file: create(:file))
        do_request(id: migrated_file.id)
        assert_status 404
      end
    end
  end

  post 'web_api/v1/projects/:project_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :name, 'The name of the file, including the file extension', required: true
      parameter :ordering, 'An integer that is used to order the file attachments within a project', required: false
    end

    ValidationErrorHelper.new.error_fields(self, ProjectFile)

    let(:ordering) { 1 }
    let(:name) { 'minimal_pdf.pdf' }
    let(:file) { file_as_base64 name, 'application/pdf' }

    context 'when there are no legacy files' do
      let!(:file_attachment) { create(:file_attachment, attachable: project, position: 1) }

      example 'Create a file as a file attachment' do
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
    end

    context 'when there are legacy files' do
      before { create(:project_file, project: project) }

      example 'Create a file as a legacy file' do
        expect { do_request }
          .to change(ProjectFile, :count).by(1)

        assert_status 201
        expect(response_data[:id]).to be_present

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
      end
    end

    context 'when there are only migrated legacy files' do
      before { create(:project_file, project: project, migrated_file: create(:file)) }

      example 'Create a file as a file attachment' do
        expect { do_request }
          .to change(Files::File, :count).by(1)
          .and(change(Files::FileAttachment, :count).by(1))
          .and(change(Files::FilesProject, :count).by(1))
          .and not_change(ProjectFile, :count)

        assert_status 201
      end
    end
  end
end
