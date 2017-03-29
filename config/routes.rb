Rails.application.routes.draw do

  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :ideas
      # auth
      post 'user_token' => 'user_token#create'
      post 'social_login' => 'social_login#create'

      resources :users do
        get :me, on: :collection
      end

      resources :topics, only: [:index, :show]
      resources :areas, only: [:index, :show]

      get 'tenants/current'
    end
  end
end
