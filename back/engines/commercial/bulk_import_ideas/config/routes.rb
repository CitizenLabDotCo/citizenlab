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
      end
      resources :ideas do
        get 'idea_import', on: :member, controller: 'import_ideas', action: 'idea_import'
      end
    end
  end
end

Rails.application.routes.draw do
  mount BulkImportIdeas::Engine => ''
end
