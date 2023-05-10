# frozen_string_literal: true

PublicApi::Engine.routes.draw do
  namespace :v1 do
    # Authentication for all endpoints
    post 'authenticate' => 'api_token#create'

    # Legacy API endpoints
    resources :ideas, only: %i[index show]
    resources :projects, only: %i[index show] do
      resources :phases, only: %i[index show], shallow: true
    end

    # New API endpoints
    get '/:locale/users', to: 'users#index'
    get '/:locale/users/:id', to: 'users#show'

    get '/:locale/ideas', to: 'ideas#index'
    get '/:locale/ideas/:id', to: 'ideas#show'

    get '/:locale/projects', to: 'projects#index'
    get '/:locale/projects/:id', to: 'projects#show'

    get '/:locale/phases', to: 'phases#index'
    get '/:locale/phases/:id', to: 'phases#show'
    get '/:locale/projects/:project_id/phases', to: 'phases#index'
  end
end

Rails.application.routes.draw do
  mount PublicApi::Engine => '/api', as: 'public_api'
end
