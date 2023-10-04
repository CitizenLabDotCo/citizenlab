# frozen_string_literal: true

BulkImportIdeas::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :import_ideas do
        post :bulk_create_xlsx, on: :collection, action: :bulk_create
        get :example_xlsx, on: :collection
      end
      resources :projects do
        post 'import_ideas/bulk_create', on: :member, to: 'import_ideas#bulk_create'
        get 'import_ideas/example_xlsx', on: :member, to: 'import_ideas#example_xlsx'
        get 'import_ideas/draft_ideas', on: :member, to: 'import_ideas#draft_ideas'
        # resources :custom_fields, controller: 'phase_custom_fields', only: %i[] do
        #   get 'to_pdf', on: :collection
        # end
      end
      resources :phases do
        get 'import_ideas/example_xlsx', on: :member, to: 'import_ideas#example_xlsx'
        get 'import_ideas/draft_ideas', on: :member, to: 'import_ideas#draft_ideas'

        # resources :custom_fields, controller: 'phase_custom_fields', only: %i[] do
        #   get 'to_pdf', on: :collection
        # end

      end
      resources :idea_imports, on: :member, to: 'import_ideas#show_idea_import'
      resources :idea_import_files, on: :member, to: 'import_ideas#show_idea_import_file'
    end
  end
end

Rails.application.routes.draw do
  mount BulkImportIdeas::Engine => ''
end
