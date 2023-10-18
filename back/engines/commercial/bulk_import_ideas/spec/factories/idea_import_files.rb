# frozen_string_literal: true

FactoryBot.define do
  factory :idea_import_file, class: 'BulkImportIdeas::IdeaImportFile' do
    import_type { 'pdf' }
    num_pages { 1 }
    file { Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_1.pdf').open }
    name { 'import.pdf' }
  end
end
