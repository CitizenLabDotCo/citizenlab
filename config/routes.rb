Rails.application.routes.draw do

  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :ideas do
        resources :comments, shallow: true
        resources :votes, except: [:update], shallow: true, defaults: { votable: 'Idea' }
      end

      # auth
      post 'user_token' => 'user_token#create'
      post 'social_login' => 'social_login#create'

      resources :users do
        get :me, on: :collection
      end

      resources :topics, only: [:index, :show]
      resources :areas, only: [:index, :show]

      resources :tenants, only: [:update] do
        get :current, on: :collection
      end
      # get 'tenants/current'
    end
  end
end
