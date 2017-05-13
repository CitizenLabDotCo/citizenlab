Rails.application.routes.draw do

  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :ideas do
        resources :comments, shallow: true
        resources :votes, except: [:update], shallow: true, defaults: { votable: 'Idea' } do
          post :up, on: :collection
          post :down, on: :collection
        end
      end

      # auth
      post 'user_token' => 'user_token#create'
      post 'social_login' => 'social_login#create'
      post 'social_registration' => 'social_registration#create'

      resources :users do
        get :me, on: :collection
      end

      resources :topics, only: [:index, :show]
      resources :areas, only: [:index, :show]

      resources :tenants, only: [:update] do
        get :current, on: :collection
      end
      resources :pages do
        get 'by_slug/:slug', on: :collection, to: 'pages#by_slug'
      end

      resources :projects

    end
  end
end
