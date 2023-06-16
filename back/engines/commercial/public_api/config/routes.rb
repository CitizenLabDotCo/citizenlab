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

    resources :comments, only: %i[index show]
    resources :ideas, only: %i[index show]
    resources :initiatives, only: %i[index show]
    resources :phases, only: %i[index show]
    resources :topics, only: %i[index show]
    resources :users, only: %i[index show]
    resources :votes, only: %i[index]

    resources :projects, only: %i[index show] do
      resources :phases, only: %i[index]
    end
  end
end

Rails.application.routes.draw do
  mount PublicApi::Engine => '/api', as: 'public_api'
end
