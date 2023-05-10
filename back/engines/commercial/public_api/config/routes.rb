# frozen_string_literal: true

PublicApi::Engine.routes.draw do
  namespace :v1 do
    # Original API
    post 'authenticate' => 'api_token#create'
    resources :ideas, only: %i[index show]
    resources :projects, only: %i[index show] do
      resources :phases, only: %i[index show], shallow: true
    end

    # New API
    get '/:locale/ideas', to: 'ideas#index'
    get '/:locale/projects', to: 'projects#index'
    get '/:locale/projects/:project_id/phases', to: 'phases#index'
  end
end

Rails.application.routes.draw do
  mount PublicApi::Engine => '/api', as: 'public_api'
end
