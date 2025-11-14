# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'File attachment as legacy IdeaFile' do
  explanation <<~EXPLANATION
    The implementation of this API has been updated to use the +Files:FileAttachment+
    model behind the scenes, instead of the legacy +IdeaFile+ model.
  EXPLANATION

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
    @project = create(:single_phase_ideation_project)
    @idea = create(:idea, author: @user, project: @project)
    create_list(:file_attachment, 2, attachable: @idea)
  end

  get 'web_api/v1/ideas/:idea_id/files' do
    let(:idea_id) { @idea.id }

    example_request 'List all file attachments of an idea' do
      assert_status 200
      expect(response_data.size).to eq 2
    end
  end

  get 'web_api/v1/ideas/:idea_id/files/:file_id' do
    let(:idea_id) { @idea.id }
    let(:file_id) { @idea.file_attachments.first.id }

    example_request 'Get one file attachment of an idea by id' do
      expect(status).to eq(200)

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

  patch 'web_api/v1/ideas/:idea_id/files/:file_id' do
    with_options scope: :file do
      parameter :ordering, 'An integer to update the order of the file attachments', required: false
    end

    let(:idea_id) { @idea.id }
    let(:file_id) { @idea.file_attachments.first.id }
    let(:ordering) { 3 }

    example_request 'Update the ordering of a file attachment' do
      assert_status 200
      expect(response_data.dig(:attributes, :ordering)).to eq(3)
    end
  end

  post 'web_api/v1/ideas/:idea_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :name, 'The name of the file, including the file extension', required: true
      parameter :ordering, 'An integer that is used to order the files within an idea', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Files::File)
    let(:idea_id) { @idea.id }
    let(:name) { 'afvalkalender.pdf' }
    let(:file) { file_as_base64 name, 'application/pdf' }
    let(:ordering) { 1 }

    example 'Add a file attachment to an idea' do
      expect { do_request }
        .to change(Files::File, :count).by(1)
        .and(change(Files::FileAttachment, :count).by(1))
        .and not_change(IdeaFile, :count)

      assert_status 201

      expect(response_data[:attributes]).to include(
        file: be_present,
        ordering: 1,
        name: name
      )
    end
  end

  delete 'web_api/v1/ideas/:idea_id/files/:file_id' do
    let(:idea_id) { @idea.id }
    let(:file_attachment) { @idea.file_attachments.first }
    let(:file_id) { file_attachment.id }

    example 'Delete the file attachment by id and its underlying file' do
      file_id = file_attachment.file_id

      expect { do_request }
        .to change(Files::FileAttachment, :count).by(-1)
        # Special case: idea files are automatically deleted when detached from their idea
        .and change(Files::File, :count).by(-1)
        .and not_change(IdeaFile, :count)

      assert_status 200

      expect { Files::File.find(file_id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { file_attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
