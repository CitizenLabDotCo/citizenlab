Rails.application.routes.draw do

  mount AdminApi::Engine => "/admin_api", as: 'admin_api', defaults: {format: :json}
  mount CustomStatuses::Engine => "", as: 'custom_statuses'
  mount EmailCampaigns::Engine => "", as: 'email_campaigns'
  mount Frontend::Engine => "", as: 'frontend'
  mount MachineTranslations::Engine => "", as: 'machine_translations'
  mount Maps::Engine => "", as: 'maps'
  mount NLP::Engine => "", as: 'nlp'
  mount Onboarding::Engine => "", as: 'onboarding'
  mount Polls::Engine => "", as: 'polls'
  mount PublicApi::Engine => "/api", as: 'public_api'
  mount Surveys::Engine => "", as: 'surveys'
  mount Tagging::Engine => "", as: 'tagging'
  mount Verification::Engine => "", as: 'verification'
  mount Volunteering::Engine => "", as: 'volunteering'

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do

      concern :votable do
        resources :votes, except: [:update], shallow: true do
          post :up, on: :collection
          post :down, on: :collection
        end
      end
      concern :post do
        resources :activities, only: [:index]
        resources :comments, shallow: true,
          concerns: [:votable, :spam_reportable],
          defaults: { votable: 'Comment', spam_reportable: 'Comment' } do

          get :children, on: :member
          post :mark_as_deleted, on: :member
        end
        get 'comments/as_xlsx', on: :collection, to: 'comments#index_xlsx'
        resources :official_feedback, shallow: true
      end
      concern :spam_reportable do
        resources :spam_reports, shallow: true
      end

      resources :ideas,
        concerns: [:votable, :spam_reportable, :post],
        defaults: { votable: 'Idea', spam_reportable: 'Idea', post: 'Idea' } do

        resources :images, defaults: {container_type: 'Idea'}
        resources :files, defaults: {container_type: 'Idea'}

        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get :as_xlsx_with_tags, on: :collection, action: 'index_with_tags_xlsx'
        get :mini, on: :collection, action: 'index_mini'
        get 'by_slug/:slug', on: :collection, to: 'ideas#by_slug'
        get :as_markers, on: :collection, action: 'index_idea_markers'
        get :filter_counts, on: :collection
      end

      resources :initiatives,
        concerns: [:votable, :spam_reportable, :post],
        defaults: { votable: 'Initiative', spam_reportable: 'Initiative', post: 'Initiative' } do

        resources :images, defaults: {container_type: 'Initiative'}
        resources :files, defaults: {container_type: 'Initiative'}

        resources :initiative_status_changes, shallow: true, except: [:update, :destroy]

        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get 'by_slug/:slug', on: :collection, to: 'initiatives#by_slug'
        get :as_markers, on: :collection, action: 'index_initiative_markers'
        get :filter_counts, on: :collection
        get :allowed_transitions, on: :member
      end

      resources :idea_statuses, only: %i[index show]
      resources :initiative_statuses, only: %i[index show]

      # auth
      post 'user_token' => 'user_token#create'


      scope :users do
        resources :custom_fields, controller: 'user_custom_fields' do
          patch 'reorder', on: :member
          get 'schema', on: :collection
          resources :custom_field_options do
            patch 'reorder', on: :member
          end
        end
      end

      resources :users do
        resources :comments, only: [:index], controller: 'user_comments'
        get :me, on: :collection
        post :complete_registration, on: :collection
        get :as_xlsx, on: :collection, action: 'index_xlsx'
        post "reset_password_email" => "reset_password#reset_password_email", on: :collection
        post "reset_password" => "reset_password#reset_password", on: :collection
        get 'by_slug/:slug', on: :collection, to: 'users#by_slug'
        get 'by_invite/:token', on: :collection, to: 'users#by_invite'
        get 'ideas_count', on: :member
        get 'initiatives_count', on: :member
        get 'comments_count', on: :member
      end

      resources :topics do
        patch 'reorder', on: :member
      end

      resources :projects_topics, only: [:index, :show, :create, :reorder, :destroy] do
        patch 'reorder', on: :member
      end

      resources :areas do
        patch 'reorder', on: :member
      end

      resource :app_configuration, only: [:show, :update]

      resources :pages do
        resources :files, defaults: {container_type: 'Page'}, shallow: false
        get 'by_slug/:slug', on: :collection, to: 'pages#by_slug'
      end

      # :action is already used as param, so we chose :permission_action instead
      resources :permissions, param: :permission_action do
        get 'participation_conditions', on: :member
      end
      concern :participation_context do
        # :action is already used as param, so we chose :permission_action instead
        resources :permissions, param: :permission_action do
          get 'participation_conditions', on: :member
        end
      end

      # Events and phases are split in two because we cannot have a non-shallow
      # resource (i.e. files) nested in a shallow resource. File resources have
      # to be shallow so we can determine their container class. See e.g.
      # https://github.com/rails/rails/pull/24405

      resources :events, only: %i[show edit update destroy] do
        resources :files, defaults: { container_type: 'Event' }, shallow: false
      end

      resources :phases,
                only: %i[show edit update destroy],
                concerns: %i[participation_context],
                defaults: { parent_param: :phase_id } do
        resources :files, defaults: { container_type: 'Phase' }, shallow: false
      end

      resources :projects,
                concerns: %i[participation_context],
                defaults: { parent_param: :project_id } do

        resources :events, only: %i[index new create]
        resources :projects_topics, only: [:index]
        resources :topics, only: %i[index reorder] do
          patch 'reorder', on: :member
        end
        resources :phases, only: %i[index new create]
        resources :images, defaults: { container_type: 'Project' }
        resources :files, defaults: { container_type: 'Project' }
        resources :groups_projects, shallow: true, except: [:update]
        resources :moderators, except: [:update] do
          get :users_search, on: :collection
        end
        resources :custom_fields, controller: 'idea_custom_fields', only: %i[index show] do
          get 'schema', on: :collection
          patch 'by_code/:code', action: 'upsert_by_code', on: :collection
        end
        get 'by_slug/:slug', on: :collection, to: 'projects#by_slug'
      end
      resources :admin_publications, only: %i[index show] do
        patch 'reorder', on: :member
      end

      resources :notifications, only: %i[index show] do
        post 'mark_read', on: :member
        post 'mark_all_read', on: :collection
      end

      resources :groups do
        resources :memberships, shallow: true, except: [:update] do
          get :users_search, on: :collection
          get 'by_user_id/:user_id', on: :collection, to: 'memberships#show_by_user_id'
          delete 'by_user_id/:user_id', on: :collection, to: 'memberships#destroy_by_user_id'
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

      scope 'stats' do
        route_params = {controller: 'stats_users'}
        get 'users_count', **route_params

        get 'users_by_time', **route_params
        get 'users_by_time_cumulative', **route_params
        get 'active_users_by_time', **route_params
        get 'active_users_by_time_cumulative', **route_params
        get 'users_by_gender', **route_params
        get 'users_by_birthyear', **route_params
        get 'users_by_domicile', **route_params
        get 'users_by_education', **route_params
        get 'users_engagement_scores', **route_params
        get 'users_by_custom_field/:custom_field_id', action: :users_by_custom_field, **route_params

        get 'users_by_time_as_xlsx', **route_params
        get 'users_by_time_cumulative_as_xlsx', **route_params
        get 'active_users_by_time_as_xlsx', **route_params
        get 'users_by_gender_as_xlsx', **route_params
        get 'users_by_birthyear_as_xlsx', **route_params
        get 'users_by_domicile_as_xlsx', **route_params
        get 'users_by_education_as_xlsx', **route_params
        get 'users_by_custom_field_as_xlsx/:custom_field_id', action: :users_by_custom_field_as_xlsx, **route_params

        route_params = {controller: 'stats_ideas'}
        get 'ideas_count', **route_params

        get 'ideas_by_time', **route_params
        get 'ideas_by_time_cumulative', **route_params
        get 'ideas_by_topic', **route_params
        get 'ideas_by_project', **route_params
        get 'ideas_by_area', **route_params
        get 'ideas_by_status', **route_params
        get 'ideas_by_status_as_xlsx', **route_params

        get 'ideas_by_time_as_xlsx', **route_params
        get 'ideas_by_time_cumulative_as_xlsx', **route_params
        get 'ideas_by_topic_as_xlsx', **route_params
        get 'ideas_by_project_as_xlsx', **route_params
        get 'ideas_by_area_as_xlsx', **route_params

        route_params = { controller: 'stats_initiatives' }
        get 'initiatives_count', **route_params
        get 'initiatives_by_time', **route_params
        get 'initiatives_by_time_cumulative', **route_params
        get 'initiatives_by_topic', **route_params
        get 'initiatives_by_area', **route_params

        route_params = { controller: 'stats_comments' }
        get 'comments_count', **route_params
        get 'comments_by_time', **route_params
        get 'comments_by_time_cumulative', **route_params
        get 'comments_by_topic', **route_params
        get 'comments_by_project', **route_params

        get 'comments_by_time_as_xlsx', **route_params
        get 'comments_by_time_cumulative_as_xlsx', **route_params
        get 'comments_by_topic_as_xlsx', **route_params
        get 'comments_by_project_as_xlsx', **route_params

        route_params = { controller: 'stats_votes' }
        get 'votes_count', **route_params
        get 'votes_by_birthyear', **route_params
        get 'votes_by_education', **route_params
        get 'votes_by_domicile', **route_params
        get 'votes_by_gender', **route_params
        get 'votes_by_custom_field', **route_params
        get 'votes_by_time', **route_params
        get 'votes_by_time_cumulative', **route_params
        get 'votes_by_topic', **route_params
        get 'votes_by_project', **route_params

        get 'votes_by_birthyear_as_xlsx', **route_params
        get 'votes_by_education_as_xlsx', **route_params
        get 'votes_by_domicile_as_xlsx', **route_params
        get 'votes_by_gender_as_xlsx', **route_params
        get 'votes_by_custom_field_as_xlsx', **route_params
        get 'votes_by_time_as_xlsx', **route_params
        get 'votes_by_time_cumulative_as_xlsx', **route_params
        get 'votes_by_topic_as_xlsx', **route_params
        get 'votes_by_project_as_xlsx', **route_params
      end

      scope 'mentions', controller: 'mentions' do
        get 'users'
      end

      scope 'action_descriptors', controller: 'action_descriptors' do
        get 'initiatives'
      end

      resources :baskets, except: [:index]
      resources :clusterings

      resources :avatars, only: [:index, :show]
      resources :moderations, only: [:index] do
        patch ':moderatable_type/:moderatable_id' => 'moderations#update', on: :collection
      end
    end


  end

  get '/auth/:provider/callback', to: 'omniauth_callback#create'
  post '/auth/:provider/callback', to: 'omniauth_callback#create'
  get '/auth/failure', to: 'omniauth_callback#failure'
  post '/auth/failure', to: 'omniauth_callback#failure'
  get '/auth/:provider/logout', to: 'omniauth_callback#logout'

  if Rails.env.development?
    require 'que/web'
    mount Que::Web => '/que'
  end
end
