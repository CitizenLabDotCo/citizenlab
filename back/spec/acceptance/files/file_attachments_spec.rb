# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'

resource 'FileAttachments' do
  header 'Content-Type', 'application/json'

  get 'web_api/v1/file_attachments' do
    parameter :attachable_id, 'Filter by attachable id', required: false
    parameter :file_id, 'Filter by file id', required: false

    let!(:event) { create(:event) }
    let!(:event_attachments) { create_pair(:file_attachment, attachable: event) }
    let!(:project) { create(:project) }
    let!(:project_attachment) { create(:file_attachment, attachable: project) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all file attachments' do
        assert_status 200
        expect(response_data.size).to eq(3)
      end

      example 'List all file attachments for a specific attachable', document: false do
        do_request(attachable_id: event.id)
        assert_status 200
        expect(response_ids).to match_array event_attachments.map(&:id)
      end

      example 'List all file attachments for a specific file', document: false do
        do_request(file_id: project_attachment.file.id)
        assert_status 200
        expect(response_ids).to contain_exactly(project_attachment.id)
      end
    end

    context 'when visitor' do
      before { project.admin_publication.update!(publication_status: 'draft') }

      example 'List file attachments of attachables that the user can view', document: false do
        do_request
        assert_status 200
        expect(response_ids).to match_array event_attachments.map(&:id)
      end
    end
  end

  get 'web_api/v1/file_attachments/:id' do
    let_it_be(:project, reload: true) { create(:project) }
    let_it_be(:file_attachment) { create(:file_attachment, attachable: project) }

    let(:id) { file_attachment.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get a file attachment by id' do
        assert_status 200

        expect(response_data).to match(
          id: file_attachment.id,
          type: 'file_attachment',
          attributes: {
            position: file_attachment.position,
            file_url: file_attachment.file.content.url,
            file_name: file_attachment.file.name,
            file_size: file_attachment.file.size,
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

    context 'when visitor' do
      example 'Get a file attachment for an attachable that the user can view', document: false do
        do_request
        assert_status 200
      end

      example '[error] Get a file attachment for an attachable that the user cannot view', document: false do
        project.admin_publication.update!(publication_status: 'draft')
        do_request
        assert_status 401
      end
    end
  end

  post 'web_api/v1/file_attachments' do
    let_it_be(:file) { create(:file) }
    let_it_be(:attachable) { file.projects.first }

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

    context 'when admin' do
      let(:admin) { create(:admin) }

      before { header_token_for(admin) }

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
            file_url: file.content.url,
            file_name: file.name,
            file_size: file.size,
            created_at: anything,
            updated_at: anything
          },
          relationships: {
            file: { data: { id: file.id, type: 'file' } },
            attachable: { data: { id: attachable.id, type: 'project' } }
          }
        )
      end

      # top-level files are files that do not belong to a project
      context 'when the file is a top-level file uploaded by the current user' do
        let(:file) { create(:global_file, uploader: admin) }

        example "Add the file to the attachable's project on the fly and create the attachment" do
          expect { do_request }.to change { file.projects.count }.by(1)

          assert_status 201
          expect(file.projects.sole).to eq(attachable.project)

          attachment = Files::FileAttachment.find(response_data[:id])
          expect(attachment.file).to eq(file)
          expect(attachment.attachable).to eq(attachable)
        end
      end
    end

    context 'when moderator of the project to which the attachable belongs' do
      before do
        moderator = create(:project_moderator, projects: [attachable])
        header_token_for(moderator)
      end

      example 'Create a file attachment' do
        do_request
        assert_status 201
      end
    end

    context 'when moderator of another project' do
      before do
        moderator = create(:project_moderator)
        header_token_for(moderator)
      end

      example '[error] Create a file attachment', document: false do
        do_request
        assert_status 401
      end
    end
  end

  patch 'web_api/v1/file_attachments/:id' do
    with_options(scope: :file_attachment) do
      parameter :position, 'Position of the file attachment'
    end

    let(:file_attachment) { create(:file_attachment, to: :project, position: 1) }
    let(:id) { file_attachment.id }
    let(:position) { 2 }

    context 'when admin' do
      before { admin_header_token }

      example 'Update a project file attachment' do
        expect { do_request }
          .to change { file_attachment.reload.position }.from(1).to(2)
          .and enqueue_job(LogActivityJob)
          .with(file_attachment, 'changed', anything, anything)

        assert_status 200
        expect(response_data.dig(:attributes, :position)).to eq(2)
      end
    end

    context 'when normal user' do
      let(:user) { create(:user) }

      before { header_token_for(user) }

      example '[error] Update a project file attachment', document: false do
        do_request
        assert_status 401
      end

      example 'Update a file attachment on their own idea', document: false do
        idea = create(:idea, author: user)
        file_attachment = create(:file_attachment, attachable: idea, position: 1)

        do_request(id: file_attachment.id, position: 2)

        assert_status 200
        expect(file_attachment.reload.position).to eq(2)
      end
    end
  end

  delete 'web_api/v1/file_attachments/:id' do
    let_it_be(:file_attachment) { create(:file_attachment, to: :event) }

    let(:id) { file_attachment.id }

    context 'when admin' do
      before { admin_header_token }

      example 'Delete a file attachment' do
        expect { do_request }.to have_enqueued_job(LogActivityJob)
        expect(response_status).to eq(200)
        expect { file_attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when normal user' do
      let(:user) { create(:user) }

      before { header_token_for(user) }

      example '[error] Delete an event file attachment', document: false do
        do_request
        assert_status 401
      end

      example 'Delete a file attachment on their own idea', document: false do
        idea = create(:idea, author: user)
        file_attachment = create(:file_attachment, attachable: idea)

        do_request(id: file_attachment.id)

        assert_status 200
        expect { file_attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  get 'web_api/v1/files/:file_id/attachments' do
    let_it_be(:file) { create(:file) }
    let_it_be(:file_attachments) { create_pair(:file_attachment, file: file) }

    let(:file_id) { file.id }

    # Add a file attachment that should not be returned.
    before { create(:file_attachment) }

    example_request 'List all file attachments of a file' do
      assert_status 200
      expect(response_data.size).to eq(2)
    end
  end

  shared_examples 'attachable resource' do |name, attachable_factory: name|
    context "#{name}s behave like an attachable resource" do
      before { admin_header_token } # rubocop:disable RSpec/ScatteredSetup

      get "web_api/v1/#{name}s/:attachable_id/file_attachments" do
        let_it_be(:attachable) { create(attachable_factory) }
        let_it_be(:file_attachments) { create_pair(:file_attachment, attachable: attachable) }

        let(:attachable_id) { attachable.id }

        # Add a file attachment that should not be returned.
        before { create(:file_attachment) } # rubocop:disable RSpec/ScatteredSetup

        example "List all file attachments of a #{name}", document: false do
          do_request
          assert_status 200
          expect(response_ids).to match_array file_attachments.map(&:id)
        end
      end

      post "web_api/v1/#{name}s/:attachable_id/file_attachments" do
        with_options(scope: :file_attachment) do
          parameter :file_id, 'ID of the file to attach', required: true
          parameter :position, 'Position of the file attachment', required: false
        end

        let(:tmp_fa) { create(:file_attachment, to: attachable_factory).tap(&:delete) }
        let(:attachable) { tmp_fa.attachable }
        let(:file) { tmp_fa.file }

        # Parameters
        let(:attachable_id) { attachable.id }
        let(:file_id) { file.id }

        example "Create a file attachment for a #{name}", document: false do
          do_request
          assert_status 201

          file_attachment = Files::FileAttachment.find(response_data[:id])
          expect(file_attachment.attachable).to eq(attachable)
          expect(file_attachment.file).to eq(file)
        end
      end
    end
  end

  include_examples 'attachable resource', 'project'
  include_examples 'attachable resource', 'event'
  include_examples 'attachable resource', 'phase'
  include_examples 'attachable resource', 'static_page'

  # Special case for ideas: the attachments cannot be created directly.
  # They are automatically managed when creating or replacing the files on the idea.
  context 'ideas behave like an attachable resource' do
    before { admin_header_token } # rubocop:disable RSpec/ScatteredSetup

    get 'web_api/v1/ideas/:attachable_id/file_attachments' do
      let_it_be(:idea) { create(:idea) }
      let_it_be(:file_attachments) { create_pair(:file_attachment, attachable: idea) }

      let(:attachable_id) { idea.id }

      # Add a file attachment that should not be returned.
      before { create(:file_attachment) } # rubocop:disable RSpec/ScatteredSetup

      example 'List all file attachments of an idea', document: false do
        do_request
        assert_status 200
        expect(response_ids).to match_array file_attachments.map(&:id)
      end
    end

    post 'web_api/v1/ideas/:attachable_id/file_attachments' do
      with_options(scope: :file_attachment) do
        parameter :file_id, 'ID of the file to attach', required: true
        parameter :position, 'Position of the file attachment', required: false
      end

      let(:attachable) { create(:idea) }
      let(:file) { create(:file, projects: [attachable.project]) }

      # Parameters
      let(:attachable_id) { attachable.id }
      let(:file_id) { file.id }

      example '[error] Cannot attach an existing file to an idea', document: false do
        do_request
        assert_status 401
      end
    end
  end
end
