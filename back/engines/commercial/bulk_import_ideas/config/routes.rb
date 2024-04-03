# frozen_string_literal: true

BulkImportIdeas::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :phases do
        post 'importer/bulk_create/:model/:format', on: :member, to: 'import_ideas#bulk_create'
        get 'importer/export_form/:model/:format', on: :member, to: 'import_ideas#export_form' # pdf or xlsx
        get 'importer/draft/:model', on: :member, to: 'import_ideas#draft_ideas'
        patch 'importer/approve_all/:model', on: :member, to: 'import_ideas#approve_all'
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
