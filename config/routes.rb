Rails.application.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do

      get 'comments/as_xlsx' => 'comments#index_xlsx'

      resources :ideas do
        resources :comments, shallow: true do
          post :mark_as_deleted, on: :member
          resources :votes, except: [:update], shallow: true, defaults: { votable: 'Comment' } do
            post :up, on: :collection
            post :down, on: :collection
          end
          resources :spam_reports, shallow: true, defaults: { spam_reportable: 'Comment' }
        end
        resources :votes, except: [:update], shallow: true, defaults: { votable: 'Idea' } do
          post :up, on: :collection
          post :down, on: :collection
        end
        resources :spam_reports, shallow: true, defaults: { spam_reportable: 'Idea' }
        resources :images, defaults: {container_class: Idea, image_class: IdeaImage}
        resources :files, defaults: {container_class: Idea, file_class: IdeaFile}
        resources :activities, only: [:index]
        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get 'by_slug/:slug', on: :collection, to: 'ideas#by_slug'
        get :as_markers, on: :collection, action: 'index_idea_markers'
      end

      resources :idea_statuses, only: [:index, :show]

      # auth
      post 'user_token' => 'user_token#create'


      scope :users do
        resources :custom_fields, defaults: {resource_type: 'User'} do
          patch 'reorder', on: :member
          get 'schema', on: :collection
          resources :custom_field_options do
            patch 'reorder', on: :member
          end
        end
      end

      resources :users do
        get :me, on: :collection
        post :complete_registration, on: :collection
        get :as_xlsx, on: :collection, action: 'index_xlsx'
        post "reset_password_email" => "reset_password#reset_password_email", on: :collection
        post "reset_password" => "reset_password#reset_password", on: :collection
        get 'by_slug/:slug', on: :collection, to: 'users#by_slug'
        get 'by_invite/:token', on: :collection, to: 'users#by_invite'
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
        resources :files, defaults: {container_class: Project, file_class: ProjectFile}
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

      resources :invites do
        post 'by_token/:token/accept', on: :collection, to: 'invites#accept'
        post :bulk_create, on: :collection
        post :bulk_create_xlsx, on: :collection
        get :example_xlsx, on: :collection
        get :as_xlsx, on: :collection, action: 'index_xlsx'
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

  get '/auth/:provider/callback', to: 'omniauth_callback#create'
  get '/auth/failure', to: 'omniauth_callback#failure'


  mount PublicApi::Engine => "/api", as: 'public_api'
  mount AdminApi::Engine => "/admin_api", as: 'admin_api', defaults: {format: :json}


end