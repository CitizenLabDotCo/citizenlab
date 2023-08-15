# frozen_string_literal: true

FactoryBot.define do
  factory :idea_import, class: 'BulkImportIdeas::IdeaImport' do
    association :idea, factory: :idea
    page_range { [1, 2] }
    user_created { false }
    file { nil }
  end
end
