# frozen_string_literal: true

BulkImportIdeas::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :import_ideas do
        post :bulk_create_xlsx, on: :collection
        get :example_xlsx, on: :collection
      end
    end
  end
end

Rails.application.routes.draw do
  mount BulkImportIdeas::Engine => ''
end
