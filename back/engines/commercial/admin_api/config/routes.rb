# frozen_string_literal: true

AdminApi::Engine.routes.draw do
  resources :tenants do
    get :by_host, on: :collection
    get :settings_schema, on: :collection
    get :style_schema, on: :collection
    get :templates, on: :collection
    patch :remove_locale, on: :member
  end

  resources :projects, only: [:index] do
    get :widget_projects, on: :collection
    get :template_export, on: :member
    post :template_import, on: :collection
    resources :phases, only: [:index]
    get :participants_count, controller: 'participants', on: :member
    get :project_description_layout_multiloc, controller: 'content_builder_layouts', on: :member
  end

  resources :users, only: %i[index create update show] do
    get :by_email, on: :collection
    get :jwt_token, on: :member
    delete :bulk_delete_by_emails, on: :collection
  end

  resources :jobs, only: [:show]

  resources :areas, only: [:index]

  resources :invites, only: [:create]

  resources :ideas, only: %i[index show]

  post '/graphql', to: 'graphql#execute'
end

Rails.application.routes.draw do
  mount AdminApi::Engine => '/admin_api', as: 'admin_api', defaults: { format: :json }
end
