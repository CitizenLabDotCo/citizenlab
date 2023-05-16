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

  # New API endpoints
  namespace :v2 do
    post 'authenticate' => 'api_token#create'

    get '/users', to: 'users#index'
    get '/users/:id', to: 'users#show'

    get '/ideas/votes', to: 'votes#for_ideas'
    get '/ideas/comments/votes', to: 'votes#for_idea_comments'
    get '/initiatives/votes', to: 'votes#for_initiatives'
    get '/initiatives/comments/votes', to: 'votes#for_initiative_comments'

    get '/comments', to: 'comments#index'
    get '/comments/:id', to: 'comments#show'
    get '/ideas/comments', to: 'comments#for_ideas'
    get '/initiatives/comments', to: 'comments#for_initiatives'

    get '/ideas', to: 'ideas#index'
    get '/ideas/:id', to: 'ideas#show'

    get '/initiatives', to: 'initiatives#index'
    get '/initiatives/:id', to: 'initiatives#show'

    get '/projects', to: 'projects#index'
    get '/projects/:id', to: 'projects#show'

    get '/phases', to: 'phases#index'
    get '/phases/:id', to: 'phases#show'
    get '/projects/:project_id/phases', to: 'phases#by_project'

    get '/topics', to: 'topics#index'
    get '/topics/:id', to: 'topics#show'
  end
end

Rails.application.routes.draw do
  mount PublicApi::Engine => '/api', as: 'public_api'
end
