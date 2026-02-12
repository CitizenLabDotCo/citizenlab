# frozen_string_literal: true

FactoryBot.define do
  factory :project_import, class: 'BulkImportIdeas::ProjectImport' do
    association :project
    locale { 'en' }
  end
end