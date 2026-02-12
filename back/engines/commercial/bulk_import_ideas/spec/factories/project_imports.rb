FactoryBot.define do
  factory :project_import, class: 'BulkImportIdeas::ProjectImport' do
    association :project
    locale { 'en' }
  end
end
