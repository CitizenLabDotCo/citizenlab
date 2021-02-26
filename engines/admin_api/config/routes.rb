AdminApi::Engine.routes.draw do
  resources :tenants do
    get :settings_schema, on: :collection
    get :style_schema, on: :collection
    get :templates, on: :collection
  end

  resources :projects, only: [:index] do
    get :template_export, on: :member
    post :template_import, on: :collection
    resources :phases, only: [:index]
  end

  resources :users, only: [:index, :create, :update, :show] do
    get :by_email, on: :collection
  end

  resources :areas, only: [:index]

  resources :invites, only: [:create]

  resources :ideas, only: [:show]

  post "/graphql", to: "graphql#execute"

end
