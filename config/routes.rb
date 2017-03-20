Rails.application.routes.draw do

  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :ideas
      # auth
      post 'user_token' => 'user_token#create'
      post 'social_login' => 'login#create'

      resources :users do
        get :me, on: :collection
      end

      get 'tenants/current'
    end
  end
end
