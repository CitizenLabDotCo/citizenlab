# frozen_string_literal: true

BulkImportIdeas::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :phases do
        post 'importer/bulk_create_async/:model/:format', on: :member, to: 'bulk_import#bulk_create_async'
        get 'importer/export_form/:model/:format', on: :member, to: 'bulk_import#export_form'
        get 'importer/draft_records/:model', on: :member, to: 'bulk_import#draft_records'
        patch 'importer/approve_all/:model', on: :member, to: 'bulk_import#approve_all'
        post 'importer/create_user', on: :member, to: 'phase_users#create_user'
      end
      resources :idea_imports, on: :member, to: 'bulk_import#show_idea_import'
      resources :idea_import_files, on: :member, to: 'bulk_import#show_idea_import_file'
    end
  end
end

Rails.application.routes.draw do
  mount BulkImportIdeas::Engine => ''
end
