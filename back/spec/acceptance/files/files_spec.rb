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
            created_at: file.created_at.iso8601(3),
            updated_at: file.updated_at.iso8601(3),
            size: 130,
            mime_type: 'application/pdf'
          },
          relationships: {
            uploader: { data: { id: file.uploader_id, type: 'user' } },
            projects: { data: [{ id: project.id, type: 'project' }] }
          }
        )
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
      parameter :project, 'The project to which the file will be uploaded', required: false
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
        expect(file.project_ids).to contain_exactly(project)
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
end
