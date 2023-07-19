# frozen_string_literal: true

PublicApi::Engine.routes.draw do
  # Legacy API endpoints
  namespace :v1 do
    post 'authenticate' => 'api_token#create'
    resources :ideas, only: %i[index show]
    resources :projects, only: %i[index show] do
      resources :phases, only: %i[index show], shallow: true
    end
  end

  namespace :v2 do
    post 'authenticate' => 'api_token#create'

    concern :deleted_items do
      get 'deleted', on: :collection
    end

    resources :comments, only: %i[index show]
    resources :ideas, only: %i[index show], concerns: :deleted_items
    resources :initiatives, only: %i[index show]
    resources :phases, only: %i[index show]
    resources :project_folders, only: %i[index show]
    resources :reactions, only: %i[index]
    resources :topics, only: %i[index show]
    resources :users, only: %i[index show]

    resources :projects, only: %i[index show] do
      resources :phases, only: %i[index]
    end
  end
end

Rails.application.routes.draw do
  mount PublicApi::Engine => '/api', as: 'public_api'

  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :api_clients, except: [:update]
    end
  end
end
