# frozen_string_literal: true

Rails.application.routes.draw do
  mount EmailCampaigns::Engine => '', as: 'email_campaigns'
  mount Frontend::Engine => '', as: 'frontend'
  mount Onboarding::Engine => '', as: 'onboarding'
  mount Polls::Engine => '', as: 'polls'
  mount Seo::Engine => '', as: 'seo'
  mount Surveys::Engine => '', as: 'surveys'
  mount Volunteering::Engine => '', as: 'volunteering'

  # It must come before +resource :ideas+, otherwise /web_api/v1/ideas/geotagged
  # (unfortunate route naming) is captured by /web_api/v1/ideas/<idea-id>.
  # Already tried +Rails.applications.routes.prepend+. That does not work:
  # https://github.com/rails/rails/issues/11663
  mount GeographicDashboard::Engine => '', as: 'geographic_dashboard'

  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      concern :reactable do
        resources :reactions, except: [:update], shallow: true do
          post :up, on: :collection
          post :down, on: :collection
        end
      end
      concern :followable do
        resources :followers, only: [:create]
      end
      concern :post do
        resources :activities, only: [:index]
        resources :comments, shallow: true,
          concerns: %i[reactable spam_reportable],
          defaults: { reactable: 'Comment', spam_reportable: 'Comment' } do
          get :children, on: :member
          post :mark_as_deleted, on: :member
        end
        resources :internal_comments, except: [:destroy], shallow: true do
          get :children, on: :member
          patch :mark_as_deleted, on: :member
        end
        get 'comments/as_xlsx', on: :collection, to: 'comments#index_xlsx'
        resources :official_feedback, shallow: true
      end
      concern :spam_reportable do
        resources :spam_reports, shallow: true
      end

      resources :ideas,
        concerns: %i[reactable spam_reportable post followable],
        defaults: { reactable: 'Idea', spam_reportable: 'Idea', post: 'Idea', followable: 'Idea' } do
        resources :images, defaults: { container_type: 'Idea' }
        resources :files, defaults: { container_type: 'Idea' }

        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get :mini, on: :collection, action: 'index_mini'
        get 'by_slug/:slug', on: :collection, to: 'ideas#by_slug'
        get :as_markers, on: :collection, action: 'index_idea_markers'
        get :filter_counts, on: :collection
        get :json_forms_schema, on: :member
      end

      resources :initiatives,
        concerns: %i[reactable spam_reportable post followable],
        defaults: { reactable: 'Initiative', spam_reportable: 'Initiative', post: 'Initiative', followable: 'Initiative' } do
        resources :images, defaults: { container_type: 'Initiative' }
        resources :files, defaults: { container_type: 'Initiative' }

        resources :initiative_status_changes, shallow: true, except: %i[update destroy]

        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get 'by_slug/:slug', on: :collection, to: 'initiatives#by_slug'
        get :as_markers, on: :collection, action: 'index_initiative_markers'
        get :filter_counts, on: :collection
        get :allowed_transitions, on: :member
        patch :accept_cosponsorship_invite, on: :member
      end

      resources :idea_statuses, only: %i[index show]
      resources :initiative_statuses, only: %i[index show]

      # auth
      post 'user_token' => 'user_token#create'

      resources :users, only: %i[index create update destroy] do
        get :me, on: :collection
        get :seats, on: :collection
        get :as_xlsx, on: :collection, action: 'index_xlsx'
        patch :block, :unblock, on: :member
        post 'reset_password_email' => 'reset_password#reset_password_email', on: :collection
        post 'reset_password' => 'reset_password#reset_password', on: :collection
        post 'update_password', on: :collection
        get 'by_slug/:slug', on: :collection, to: 'users#by_slug'
        get 'by_invite/:token', on: :collection, to: 'users#by_invite'
        get 'ideas_count', on: :member
        get 'initiatives_count', on: :member
        get 'comments_count', on: :member
        get 'blocked_count', on: :collection
        get 'check/:email', on: :collection, to: 'users#check', constraints: { email: /.*/ }

        resources :comments, only: [:index], controller: 'user_comments'
      end

      get 'users/:attendee_id/events', to: 'events#index'
      get 'users/:id', to: 'users#show', constraints: { id: /\b(?!custom_fields|me)\b\S+/ }

      scope path: 'user' do
        resource :confirmation, path: :confirm, only: %i[create]
        resource :resend_code, only: %i[create]
      end

      resources :topics do
        patch 'reorder', on: :member

        resources :followers, only: [:create], defaults: { followable: 'Topic' }
      end

      resources :areas do
        patch 'reorder', on: :member

        resources :followers, only: [:create], defaults: { followable: 'Area' }
      end

      resources :followers, except: %i[create update]

      resource :app_configuration, only: %i[show update]

      resources :static_pages do
        resources :files, defaults: { container_type: 'StaticPage' }, shallow: false
        get 'by_slug/:slug', on: :collection, to: 'static_pages#by_slug'
      end

      resources :nav_bar_items, only: %i[index create update destroy] do
        get 'removed_default_items', on: :collection
        patch 'reorder', on: :member
      end

      # Events and phases are split in two because we cannot have a non-shallow
      # resource (i.e. files) nested in a shallow resource. File resources have
      # to be shallow so we can determine their container class. See e.g.
      # https://github.com/rails/rails/pull/24405

      resources :events, only: %i[index show edit update destroy] do
        resources :files, defaults: { container_type: 'Event' }, shallow: false
        resources :images, defaults: { container_type: 'Event' }
        resources :attendances, module: 'events', only: %i[create index]
      end
      resources :event_attendances, only: %i[destroy], controller: 'events/attendances'

      resources :phases, only: %i[show edit update destroy] do
        resources :files, defaults: { container_type: 'Phase' }, shallow: false
        get 'survey_results', on: :member
        get :as_xlsx, on: :member, action: 'index_xlsx'
        get 'submission_count', on: :member
        delete 'inputs', on: :member, action: 'delete_inputs'
        resources :custom_fields, controller: 'phase_custom_fields', only: %i[] do
          get 'json_forms_schema', on: :collection
        end
      end

      resources :projects, concerns: [:followable], defaults: { followable: 'Project' } do
        resources :events, only: %i[new create]
        resources :projects_allowed_input_topics, only: [:index]
        resources :phases, only: %i[index new create]
        resources :images, defaults: { container_type: 'Project' }
        resources :files, defaults: { container_type: 'Project' }
        resources :groups_projects, shallow: true, except: [:update]

        resources :custom_fields, controller: 'project_custom_fields', only: %i[] do
          get 'json_forms_schema', on: :collection
        end

        resources :moderators, controller: 'project_moderators', except: [:update] do
          get :users_search, on: :collection
        end

        post 'copy', on: :member
        get 'by_slug/:slug', on: :collection, to: 'projects#by_slug'
        get 'survey_results', on: :member
        get 'submission_count', on: :member
        get :as_xlsx, on: :member, action: 'index_xlsx'
        delete 'inputs', on: :member, action: 'delete_inputs'
      end

      resources :projects_allowed_input_topics, only: %i[show create destroy] do
        patch 'reorder', on: :member
      end

      resources :admin_publications, only: %i[index show] do
        patch 'reorder', on: :member
        get 'status_counts', on: :collection
      end

      resources :project_folders, controller: 'folders', concerns: [:followable], defaults: { followable: 'ProjectFolders::Folder' } do
        resources :moderators, controller: 'folder_moderators', except: %i[update]

        resources :images, controller: '/web_api/v1/images', defaults: { container_type: 'ProjectFolder' }
        resources :files, controller: '/web_api/v1/files', defaults: { container_type: 'ProjectFolder' }
        get 'by_slug/:slug', on: :collection, to: 'folders#by_slug'
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
        post :count_new_seats_xlsx, on: :collection # it is POST because we need to send a file in body
        post :count_new_seats, on: :collection # it is POST to make it similar to other bulk_create_ and count_new_ actions
        get :example_xlsx, on: :collection
        get :as_xlsx, on: :collection, action: 'index_xlsx'
      end

      resource :home_page, only: %i[show update]

      resources :experiments, only: %i[index create]

      scope 'stats' do
        route_params = { controller: 'stats_users' }
        get 'users_count', **route_params

        get 'users_by_time', **route_params
        get 'users_by_time_cumulative', **route_params
        get 'active_users_by_time', **route_params
        get 'active_users_by_time_cumulative', **route_params

        get 'users_by_time_as_xlsx', **route_params
        get 'users_by_time_cumulative_as_xlsx', **route_params
        get 'active_users_by_time_as_xlsx', **route_params

        route_params = { controller: 'stats_ideas' }
        get 'ideas_count', **route_params

        get 'ideas_by_topic', **route_params
        get 'ideas_by_project', **route_params
        get 'ideas_by_status', **route_params
        get 'ideas_by_status_as_xlsx', **route_params

        get 'ideas_by_topic_as_xlsx', **route_params
        get 'ideas_by_project_as_xlsx', **route_params

        route_params = { controller: 'stats_initiatives' }
        get 'initiatives_count', **route_params

        route_params = { controller: 'stats_comments' }
        get 'comments_count', **route_params
        get 'comments_by_topic', **route_params
        get 'comments_by_project', **route_params

        get 'comments_by_topic_as_xlsx', **route_params
        get 'comments_by_project_as_xlsx', **route_params

        route_params = { controller: 'stats_reactions' }
        get 'reactions_count', **route_params
        get 'reactions_by_topic', **route_params
        get 'reactions_by_project', **route_params

        get 'reactions_by_topic_as_xlsx', **route_params
        get 'reactions_by_project_as_xlsx', **route_params
      end

      scope 'mentions', controller: 'mentions' do
        get 'users'
      end

      scope 'action_descriptors', controller: 'action_descriptors' do
        get 'initiatives'
      end

      resources :baskets, except: [:index] do
        resources :baskets_ideas, shallow: true
      end
      put 'baskets/ideas/:idea_id', to: 'baskets_ideas#upsert'

      resources :avatars, only: %i[index show]
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
