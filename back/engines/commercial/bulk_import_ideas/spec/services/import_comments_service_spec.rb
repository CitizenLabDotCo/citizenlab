# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportCommentsService do
  let(:admin_user) { create(:admin) }
  let(:idea) { create(:idea, author: admin_user) }
  let(:service) { described_class.new(:admin_user) }

  describe 'import' do
    it 'uploads a file and does not import any comments because the IDs in the file are incorrect' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/import_comments.xlsx').read
      service.import "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}"
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 1
      expect(Comment.count).to eq 0
    end
  end

  describe 'import_comments' do
    it 'imports multiple comments and creates new authors' do
      comment_rows = [
        {
          idea_id: idea.id,
          comment: 'Comment 1',
          user_consent: true,
          user_email: 'userimport1@citizenlab.co',
          user_first_name: 'Gary',
          user_last_name: 'Import'
        },
        {
          idea_id: idea.id,
          comment: 'Comment 2',
          user_consent: true,
          user_email: 'userimport1@citizenlab.co',
          user_first_name: 'Gary',
          user_last_name: 'Import'
        },
        {
          idea_id: idea.id,
          comment: 'Comment 3',
          user_consent: true,
          user_email: 'userimport2@citizenlab.co',
          user_first_name: 'Bob',
          user_last_name: 'Export'
        }
      ]
      service.import_comments comment_rows

      expect(idea.reload.comments_count).to eq 3
      expect(idea.comments.pluck(:body_multiloc)).to match_array(
        [{ 'en' => 'Comment 1' }, { 'en' => 'Comment 2' }, { 'en' => 'Comment 3' }]
      )
      expect(User.count).to eq 3 # 2 users created and 1 admin
    end

    it 'ignores comments where the idea does not exist' do
      comment_rows = [
        {
          idea_id: 'non-existent-id',
          comment: 'Comment 1',
          user_consent: true,
          user_email: 'userimport1@citizenlab.co',
          user_first_name: 'Gary',
          user_last_name: 'Import'
        }
      ]
      service.import_comments comment_rows

      expect(idea.reload.comments_count).to eq 0
      expect(Comment.count).to eq 0
      expect(User.count).to eq 1 # just 1 admin
    end
  end

  describe 'generate_example_xlsx' do
    it 'produces an xlsx file with all the fields for a project' do
      xlsx = service.generate_example_xlsx
      xlsx_hash = XlsxService.new.xlsx_to_hash_array xlsx

      expect(xlsx).not_to be_nil
      expect(xlsx_hash.count).to eq 1
      # TODO: JS - more tests for xlsx generation
    end
  end
end
