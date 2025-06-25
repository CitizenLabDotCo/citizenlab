# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'

resource 'Files' do
  header 'Content-Type', 'application/json'

  get 'web_api/v1/files' do
    parameter :uploader, 'Filter files by uploader user ID(s)', type: %i[string array]

    parameter :sort, <<~SORT_DESC.squish, required: false
      Sort order. Comma-separated list of attributes. Prefix with "-" to sort in descending order.
      Options: "created_at", "-created_at", "name", "-name", "size", "-size"
    SORT_DESC

    let_it_be(:files) do
      [
        create(:file, name: 'a.pdf', created_at: 2.days.ago),
        create(:file, name: 'b.pdf', created_at: 1.day.ago)
      ]
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all files' do
        assert_status 200
        expect(response_data.size).to eq 2
      end

      describe 'when filtering by uploader' do
        let(:file) { files.first }
        let(:uploader) { file.uploader_id }

        example 'List all files for a specific uploader', document: false do
          do_request
          assert_status 200
          expect(response_data.size).to eq(1)
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

          new_file = create(:file, name: 'a.pdf')
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
    let_it_be(:file) { create(:file) }

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
            uploader: {
              data: { id: file.uploader_id, type: 'user' }
            }
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
      parameter :content, 'The content of the file encoded in base64', required: true
    end

    let(:name) { 'afvalkalender.pdf' }
    let(:content) { file_as_base64(name, 'application/pdf') }

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
        Files::File.find(response_data[:id])
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
