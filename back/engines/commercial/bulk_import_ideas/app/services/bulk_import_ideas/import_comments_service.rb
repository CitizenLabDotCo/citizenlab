# frozen_string_literal: true

module BulkImportIdeas
  class ImportCommentsService < ImportIdeasService
    def generate_example_xlsx
      XlsxService.new.hash_array_to_xlsx [
        {
          'Idea ID' => '1',
          'First name' => 'Paul',
          'Last name' => 'Moderator',
          'Permission' => 'X',
          'Comment text' => 'This is a comment',
          'Source' => 'Email'
        }
      ]
    end

    # TODO: JS - Only allow comments to be uploaded for a defined project
    # TODO: JS - refactor idea import object to keep a record of imported comments too
    def import(file_content)
      file = upload_source_file file_content

      xlsx_file = URI.open file.file_content_url
      xlsx_comments = XlsxService.new.xlsx_to_hash_array xlsx_file
      comments = format_comments(xlsx_comments)

      import_comments comments
    end

    # TODO: JS - Add validation for required fields
    # TODO: JS - Add multi-lingual support
    def format_comments(xlsx_comments)
      xlsx_comments.map do |comment|
        {
          idea_id: comment['Idea ID'],
          comment: comment['Comment text'],
          source: comment['Source'],
          user_first_name: comment['First name'],
          user_last_name: comment['Last name'],
          user_email: comment['Email address'],
          user_consent: comment['Permission'].present? && comment['Permission'] != ''
        }
      end
    end

    def import_comments(comments)
      imported_comments = []
      comments.each do |comment|
        begin
          idea = Idea.find(comment[:idea_id])
        rescue ActiveRecord::RecordNotFound => e
          next
        end

        comment_attributes = {}
        _author_created = add_author(comment, comment_attributes)

        comment = Comment.create!(
          body_multiloc: { en: comment[:comment] },
          author: comment_attributes[:author],
          post: idea
        )
        imported_comments << comment
      end
      imported_comments
    end

    def upload_source_file(file_content)
      IdeaImportFile.create!(
        import_type: 'xlsx',
        project: @project,
        file_by_content: {
          name: 'import_comments.xlsx',
          content: file_content # base64
        }
      )
    end
  end
end
