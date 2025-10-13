# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'

resource 'Files' do
  header 'Content-Type', 'application/json'

  get 'web_api/v1/files' do
    parameter :uploader, 'Filter files by uploader user ID(s)', type: %i[string array]
    parameter :project, 'Filter files by project ID(s)', type: %i[string array]
    parameter :search, 'Filter files by searching in filename'

    parameter :category, <<~CATEGORY_DESC.squish, type: %i[string array], required: false
      Filter files by category (values: #{Files::File.categories.values.join(', ')})
    CATEGORY_DESC

    parameter :sort, <<~SORT_DESC.squish, required: false
      Sort order. Comma-separated list of attributes. Prefix with "-" to sort in descending order.
      Options: "created_at", "-created_at", "name", "-name", "size", "-size"
    SORT_DESC

    let_it_be(:files) do
      [
        create(:file, name: 'report-a.pdf', created_at: 2.days.ago),
        create(:file, name: 'report-b.pdf', created_at: 1.day.ago)
      ]
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all files' do
        assert_status 200
        expect(response_data.size).to eq 2
      end

      describe 'when filtering by uploader' do
        example 'List all files for a specific uploader', document: false do
          file = files.first

          do_request(uploader: file.uploader_id)

          assert_status 200
          expect(response_ids).to eq [file.id]
        end

        example 'List all files for multiple uploaders', document: false do
          create(:file)

          do_request(uploader: files.map(&:uploader_id))

          assert_status 200
          expect(response_ids).to match_array files.map(&:id)
        end
      end

      describe 'when filtering by project' do
        let(:project) { create(:project).id }
        let!(:file) { create(:file, project_ids: [project]) }

        example 'List all files for a specific project', document: false do
          do_request
          assert_status 200
          expect(response_data.size).to eq(1)
          expect(response_ids).to eq [file.id]
        end
      end

      describe 'when searching filenames' do
        example 'Search for files by filename', document: false do
          file = create(:file, name: 'very-specific-filename.pdf')

          do_request(search: 'very-specific-filename')

          assert_status 200
          expect(response_ids).to eq [file.id]
        end
      end

      describe 'when filtering by category' do
        let_it_be(:meeting_files) { create_pair(:file, :meeting) }
        let_it_be(:report_file) { create(:file, :report) }

        example 'List files for a specific category', document: false do
          do_request(category: 'meeting')

          assert_status 200
          expect(response_ids).to match_array(meeting_files.map(&:id))
        end

        example 'List files for multiple categories', document: false do
          do_request(category: %w[meeting report])

          assert_status 200

          expected_ids = meeting_files.map(&:id) << report_file.id
          expect(response_ids).to match_array(expected_ids)
        end
      end

      describe 'sorting' do
        example 'Lists files sorted by creation date in descending order by default', document: false do
          do_request
          assert_status 200
          expect(response_ids).to eq(files.reverse.map(&:id))
        end

        example 'List files sorted correctly', document: false do
          do_request sort: 'name,-created_at'
          expect(response_ids).to eq(files.map(&:id))

          # Same name as an existing file, but created later.
          new_file = create(:file, name: 'report-a.pdf')
          do_request sort: '-name,created_at'

          expected_files = [files.last, files.first, new_file]
          expect(response_ids).to eq(expected_files.map(&:id))
        end
      end
    end

    context 'when normal user' do
      before { header_token_for create(:user) }

      example 'Returns an empty list of files', document: false do
        do_request
        assert_status 200
        expect(response_data.size).to eq 0
      end
    end
  end

  get 'web_api/v1/files/:id' do
    let_it_be(:project) { create(:project) }
    let_it_be(:file) { create(:file, projects: [project]) }

    let(:id) { file.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get one file' do
        assert_status 200

        expect(response_data).to include(
          id: file.id,
          type: 'file',
          attributes: {
            name: file.name,
            description_multiloc: {},
            description_generation_status: nil,
            content: { url: file.content.url },
            ai_processing_allowed: false,
            mime_type: 'application/pdf',
            category: file.category,
            size: 130,
            created_at: file.created_at.iso8601(3),
            updated_at: file.updated_at.iso8601(3)
          },
          relationships: {
            attachments: { data: [] },
            uploader: { data: { id: file.uploader_id, type: 'user' } },
            projects: { data: [{ id: project.id, type: 'project' }] },
            preview: { data: nil },
            transcript: { data: nil }
          }
        )
      end

      example 'Get one file with preview' do
        file_preview = create(:file_preview, file:)
        do_request
        assert_status 200
        expect(response_data.dig(:relationships, :preview, :data)).to include(
          id: file_preview.id,
          type: 'file_preview'
        )
        expect(json_response_body[:included].map { |i| i[:id] }).to include(file_preview.id)
      end
    end

    context 'when normal user' do
      before { header_token_for create(:user) }

      include_examples 'unauthorized'
    end
  end

  post 'web_api/v1/files' do
    with_options scope: :file do
      parameter :name, 'The name of the file', required: true
      parameter :content, 'The content of the file, encoded in Base64', required: true
      parameter :project, 'The project to which the file will be uploaded'
      parameter :description_multiloc, 'The description of the file, as a multiloc string'
      parameter :ai_processing_allowed, 'Whether AI processing is allowed for this file (defaults to false)'
      parameter :category, "The category of the file (values: #{Files::File.categories.values.join(', ')})"
    end

    let(:name) { 'afvalkalender.pdf' }
    let(:content) { file_as_base64(name, 'application/pdf') }
    let(:project) { create(:project).id }

    context 'when admin' do
      let(:admin) { create(:admin) }

      before { header_token_for(admin) }

      example 'Create a file' do
        expect { do_request }
          .to change(Files::File, :count).by(1)
          .and(enqueue_job(LogActivityJob).with(
            a_kind_of(Files::File),
            'created',
            admin,
            a_kind_of(Numeric)
          ))

        assert_status 201

        file = Files::File.find(response_data[:id])
        # It has been correctly associated with the project
        expect(file.project_ids).to contain_exactly(project)

        expect(response_data).to match(
          id: be_present,
          type: 'file',
          attributes: {
            name: name,
            content: { url: file.content.url },
            description_multiloc: {},
            description_generation_status: nil,
            ai_processing_allowed: false,
            mime_type: 'application/pdf',
            category: 'other',
            size: 1_645_987,
            created_at: be_present,
            updated_at: be_present
          },
          relationships: {
            attachments: { data: [] },
            uploader: { data: { id: admin.id, type: 'user' } },
            projects: { data: [{ id: project, type: 'project' }] },
            preview: { data: nil }, # pdf file doesn't generate a preview
            transcript: { data: nil }
          }
        )
      end

      example 'Create a file with category' do
        do_request(file: { name: name, content: content, category: 'meeting' })

        assert_status 201

        file = Files::File.find(response_data[:id])
        expect(file.category).to eq('meeting')
      end

      example 'Create a file with description_multiloc' do
        description_multiloc = { 'en' => 'English description', 'fr-FR' => 'Description en français' }
        do_request(file: { name: name, content: content, description_multiloc: description_multiloc })

        assert_status 201

        expect(response_data[:attributes][:description_multiloc])
          .to eq(description_multiloc.symbolize_keys)

        file = Files::File.find(response_data[:id])
        expect(file.description_multiloc).to eq(description_multiloc)
      end

      example 'Create a file with ai_processing_allowed set to true', :active_job_que_adapter, document: false do
        do_request(file: { name: name, content: content, ai_processing_allowed: true })

        assert_status 201

        expect(response_data[:attributes]).to include(
          ai_processing_allowed: true,
          description_generation_status: 'pending'
        )

        file = Files::File.find(response_data[:id])
        expect(file.ai_processing_allowed).to be true
      end

      example 'casts ai_processing_allowed to boolean', :active_job_que_adapter, document: false do
        do_request(file: { name: name, content: content, ai_processing_allowed: 'whatever' })
        assert_status 201
        expect(response_data[:attributes][:ai_processing_allowed]).to be true

        do_request(file: { name: name, content: content, ai_processing_allowed: 'off' })
        assert_status 201
        expect(response_data[:attributes][:ai_processing_allowed]).to be false
      end

      example 'create a file that supports a PDF preview', document: false do
        do_request(file: { name: 'test.docx', content: file_as_base64('david.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') })
        assert_status 201
        expect(response_data[:relationships][:preview][:data]).to include({
          id: kind_of(String),
          type: 'file_preview'
        })
      end
    end
  end

  delete 'web_api/v1/files/:id' do
    let_it_be(:file) { create(:file) }

    let(:id) { file.id }

    context 'when admin' do
      let(:admin) { create(:admin) }

      before { header_token_for(admin) }

      example 'Delete a file' do
        expect { do_request }
          .to change(Files::File, :count).by(-1)
          .and enqueue_job(LogActivityJob)

        assert_status 204
        expect { Files::File.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  patch '/web_api/v1/files/:id' do
    with_options scope: :file do
      parameter :name, 'The name of the file'
      parameter :ai_processing_allowed, 'Whether AI processing is allowed for this file'
      parameter :description_multiloc, 'The description of the file, as a multiloc string'
      parameter :category, "The category of the file (values: #{Files::File.categories.values.join(', ')})"
    end

    let(:project) { create(:project) }
    let(:file) { create(:file, :meeting, :with_description, projects: [project]) }

    # Parameters
    let(:id) { file.id }
    let(:name) { "updated-#{file.name}" }
    let(:category) { 'other' }
    let(:ai_processing_allowed) { !file.ai_processing_allowed }
    let(:description_multiloc) { { 'en' => 'Updated description' } }

    shared_examples 'update_file' do |document: false|
      example 'Update a file', document: document do
        do_request
        assert_status 200

        expect(response_data[:attributes].with_indifferent_access).to include(
          name: name,
          category: category,
          ai_processing_allowed: ai_processing_allowed,
          description_multiloc: description_multiloc
        )

        file.reload
        expect(file.name).to eq name
        expect(file.category).to eq category
        expect(file.ai_processing_allowed).to eq ai_processing_allowed
        expect(file.description_multiloc).to eq description_multiloc
      end
    end

    context 'when admin' do
      before { admin_header_token }

      include_examples 'update_file', document: true

      example '[error] Update with invalid category', document: false do
        do_request(file: { category: 'invalid_category' })

        assert_status 422
        expect(response_body).to include('category')
      end
    end

    context 'when moderator of associated project' do
      before do
        moderator = create(:project_moderator, projects: [project])
        header_token_for(moderator)
      end

      include_examples 'update_file'
    end

    context 'when moderator of other project' do
      before do
        moderator = create(:project_moderator)
        header_token_for(moderator)
      end

      include_examples 'unauthorized'
    end

    context 'when regular user' do
      before { resident_header_token }

      include_examples 'unauthorized'
    end

    context 'when visitor' do
      include_examples 'unauthorized'
    end
  end
end
