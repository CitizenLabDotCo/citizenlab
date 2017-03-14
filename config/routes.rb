Rails.application.routes.draw do

  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do
      # auth
      post 'user_token' => 'user_token#create'
      post 'social_login' => 'login#create'

      resources :users

      get 'tenants/current'
    end
  end
end
