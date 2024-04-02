# frozen_string_literal: true

BulkImportIdeas::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :phases do
        post 'importer/bulk_create/idea/xlsx', on: :member, to: 'import_ideas#bulk_create'
        get 'importer/export_form/idea/xlsx', on: :member, to: 'import_ideas#example_xlsx'
        get 'importer/export_form/idea/pdf', on: :member, to: 'import_ideas#to_pdf'
        get 'importer/draft/idea', on: :member, to: 'import_ideas#draft_ideas'
        patch 'importer/approve_all/idea', on: :member, to: 'import_ideas#approve_all'
        post 'importer/create_user', on: :member, to: 'phase_users#create_user'
      end
      resources :idea_imports, on: :member, to: 'import_ideas#show_idea_import'
      resources :idea_import_files, on: :member, to: 'import_ideas#show_idea_import_file'
    end
  end
end

Rails.application.routes.draw do
  mount BulkImportIdeas::Engine => ''
end
