# frozen_string_literal: true

FactoryBot.define do
  factory :idea_import, class: 'BulkImportIdeas::IdeaImport' do
    # t.references :idea, foreign_key: true, type: :uuid, index: true
    # t.references :import_user, foreign_key: { to_table: :users }, type: :uuid
    # t.boolean :user_created, :required, default: false
    # t.timestamp :approved_at
    # t.text :page_range, array: true, default: []
    # t.string :file_path
    # t.string :file_type
    # t.timestamps

    association :idea, factory: :idea
    page_range { [1, 2] }
    user_created { false }
    file_path { '/uploads/import.pdf' }
    file_type { 'pdf' }
  end
end
