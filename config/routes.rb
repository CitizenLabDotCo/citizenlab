Rails.application.routes.draw do

  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do

      get 'comments/as_xlsx' => 'comments#index_xlsx'

      resources :ideas do
        resources :comments, shallow: true do
          resources :votes, except: [:update], shallow: true, defaults: { votable: 'Comment' } do
            post :up, on: :collection
            post :down, on: :collection
          end
        end
        resources :votes, except: [:update], shallow: true, defaults: { votable: 'Idea' } do
          post :up, on: :collection
          post :down, on: :collection
        end
        resources :images, defaults: {container_class: Idea, image_class: IdeaImage}
        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get 'by_slug/:slug', on: :collection, to: 'ideas#by_slug'
      end

      resources :idea_statuses, only: [:index, :show]

      # auth
      post 'user_token' => 'user_token#create'

      resources :users do
        get :me, on: :collection
        get :as_xlsx, on: :collection, action: 'index_xlsx'
        post "reset_password_email" => "reset_password#reset_password_email", on: :collection
        post "reset_password" => "reset_password#reset_password", on: :collection
        get 'by_slug/:slug', on: :collection, to: 'users#by_slug'
      end

      resources :topics, only: [:index, :show]
      resources :areas, only: [:index, :show]

      resources :tenants, only: [:update] do
        get :current, on: :collection
      end
      resources :pages do
        get 'by_slug/:slug', on: :collection, to: 'pages#by_slug'
      end

      resources :projects do
        resources :phases, shallow: true
        resources :events, shallow: true
        resources :images, defaults: {container_class: Project, image_class: ProjectImage}
        resources :groups_projects, shallow: true, except: [:update]
        get 'by_slug/:slug', on: :collection, to: 'projects#by_slug'
      end

      resources :notifications, only: [:index, :show] do
        post 'mark_read', on: :member
        post 'mark_all_read', on: :collection
      end

      resources :groups do
        resources :memberships, shallow: true, except: [:update] do
          get :users_search, on: :collection
        end
        get 'by_slug/:slug', on: :collection, to: 'groups#by_slug'
      end

      scope 'stats', controller: 'stats' do
        get 'users_by_time'
        get 'users_by_gender'
        get 'users_by_birthyear'
        get 'users_by_domicile'
        get 'users_by_education'
        get 'ideas_by_time'
        get 'ideas_by_topic'
        get 'ideas_by_area'
        get 'comments_by_time'
        get 'votes_by_time'
      end

      scope 'mentions', controller: 'mentions' do
        get 'users'
      end

    end

  end



  namespace :admin_api, :defaults => {:format => :json} do
    resources :tenants do
      get :settings_schema, on: :collection
    end
  end

  get '/auth/:provider/callback', to: 'omniauth_callback#create'
  get '/auth/failure', to: 'omniauth_callback#failure'


end