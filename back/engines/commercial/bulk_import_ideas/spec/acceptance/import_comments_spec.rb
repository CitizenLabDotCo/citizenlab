# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'BulkImportComments' do
  explanation 'Create many ideas at once by importing an XLSX sheet or a scanned PDF of multiple ideas.'

  before do
    create(:idea_status, code: 'proposed')
    header 'Content-Type', 'application/json'
  end

  let!(:project) { create(:single_phase_ideation_project, title_multiloc: { en: 'Project 1' }) }

  context 'when admin' do
    before { admin_header_token }

    context 'project import' do
      parameter(:project_id, 'ID of the project to import these ideas to', required: true)

      let(:id) { project.id }

      get 'web_api/v1/projects/:id/import_comments/example_xlsx' do
        example_request 'Get the example xlsx for a project' do
          assert_status 200
        end
      end

      post 'web_api/v1/projects/:id/import_comments/bulk_create' do
        parameter(
          :xlsx,
          'Base64 encoded xlsx file with ideas details. See web_api/v1/projects/:id/import_comments/example_xlsx for the format',
          scope: :import_comments
        )
        parameter(:locale, 'Locale of the comments being imported.', scope: :import_comments)

        context 'xlsx import' do
          let(:xlsx) { create_project_bulk_import_comments_xlsx }

          example_request 'Bulk import comments to ideas from .xlsx' do
            assert_status 201
            expect(response_data.count).to eq 3
            expect(Comment.count).to eq 3
            expect(Comment.all.pluck(:body_multiloc)).to match_array [
              { 'en' => 'This is a comment' },
              { 'en' => 'This is a second comment' },
              { 'en' => 'This is a third comment' }
            ]
            expect(User.all.pluck(:email)).to include 'paul@citizenlab.co'
            expect(User.all.pluck(:email)).not_to include 'norman@citizenlab.co'
            # TODO: JS - check if comments with null author are OK + allow anonymous=true
          end
        end
      end
    end
  end

  def create_project_bulk_import_comments_xlsx
    idea = create(:idea, project: project)
    hash_array = [
      {
        'Idea ID' => idea.id,
        'Comment text' => 'This is a comment',
        'First name' => 'Paul',
        'Last name' => 'Commenter',
        'Email address' => 'paul@citizenlab.co',
        'Permission' => 'X',
        'Source' => 'Email'
      },
      {
        'Idea ID' => idea.id,
        'Comment text' => 'This is a second comment',
        'First name' => 'Norman',
        'Last name' => 'No Permission',
        'Email address' => 'norman@citizenlab.co',
        'Permission' => '',
        'Source' => 'Email'
      },
      {
        'Idea ID' => idea.id,
        'Comment text' => 'This is a third comment'
      }
    ]
    xlsx_stringio = XlsxService.new.hash_array_to_xlsx hash_array
    base_64_content = Base64.encode64 xlsx_stringio.read
    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}"
  end
end
