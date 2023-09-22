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

    with_options only: %i[index show], concerns: :deleted_items do |route_mapper|
      route_mapper.resources :comments
      route_mapper.resources :ideas
      route_mapper.resources :initiatives
      route_mapper.resources :phases
      route_mapper.resources :project_folders
      route_mapper.resources :reactions, only: %i[index]
      route_mapper.resources :topics
      route_mapper.resources :users

      route_mapper.resources :projects do
        resources :phases, only: %i[index]
      end

      route_mapper.resources :email_campaigns
      route_mapper.resources :email_campaign_deliveries
      route_mapper.resources :volunteering_causes
      route_mapper.resources :volunteering_volunteers
      route_mapper.resources :baskets
      route_mapper.resources :basket_ideas
    end

    # Association endpoints
    resources :idea_phases, only: %i[index]
    resources :idea_topics, only: %i[index]
    resources :project_topics, only: %i[index]
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
