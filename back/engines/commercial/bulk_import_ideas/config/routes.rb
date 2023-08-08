# frozen_string_literal: true

BulkImportIdeas::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :import_ideas do
        post :bulk_create_xlsx, on: :collection
        get :example_xlsx, on: :collection
        post ':project_id/bulk_create_xlsx', on: :collection, action: 'bulk_create_xlsx'
        post ':project_id/bulk_create_pdf', on: :collection, action: 'bulk_create_pdf'
        get ':project_id/example_xlsx', on: :collection, action: 'example_xlsx'
      end
    end
  end
end

Rails.application.routes.draw do
  mount BulkImportIdeas::Engine => ''
end
