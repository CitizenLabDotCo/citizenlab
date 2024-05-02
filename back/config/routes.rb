# frozen_string_literal: true

Rails.application.routes.draw do
  mount EmailCampaigns::Engine => '', as: 'email_campaigns'
  mount Frontend::Engine => '', as: 'frontend'
  mount Onboarding::Engine => '', as: 'onboarding'
  mount Polls::Engine => '', as: 'polls'
  mount Seo::Engine => '', as: 'seo'
  mount Surveys::Engine => '', as: 'surveys'
  mount Volunteering::Engine => '', as: 'volunteering'

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
      concern :permissionable do
        # We named the param :permission_action, bc :action is already taken (controller action).
        resources :permissions, param: :permission_action do
          get 'requirements', on: :member
          get 'schema', on: :member
          resources :permissions_custom_fields, shallow: true
        end
      end

      concerns :permissionable # for the global permission scope (with parent_param = nil)

      resources :ideas,
        concerns: %i[reactable spam_reportable post followable permissionable],
        defaults: { reactable: 'Idea', spam_reportable: 'Idea', post: 'Idea', followable: 'Idea', parent_param: :idea_id } do
        resources :images, defaults: { container_type: 'Idea' }
        resources :files, defaults: { container_type: 'Idea' }

        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get :mini, on: :collection, action: 'index_mini'
        get 'by_slug/:slug', on: :collection, to: 'ideas#by_slug'
        get :as_markers, on: :collection, action: 'index_idea_markers'
        get :filter_counts, on: :collection
        get :json_forms_schema, on: :member
        get 'draft/:phase_id', on: :collection, to: 'ideas#draft_by_phase'
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

      resources :background_jobs, only: %i[index]

      resources :idea_statuses, only: %i[index show]
      resources :initiative_statuses, only: %i[index show]

      resources :location, only: [] do
        get :autocomplete, on: :collection
        get :geocode, on: :collection
        get :reverse_geocode, on: :collection
      end

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
        get :attendees_xlsx, on: :member, action: 'attendees_xlsx'
      end
      resources :event_attendances, only: %i[destroy], controller: 'events/attendances'

      resources :phases, only: %i[show edit update destroy], concerns: :permissionable, defaults: { parent_param: :phase_id } do
        resources :files, defaults: { container_type: 'Phase' }, shallow: false
        get 'survey_results', on: :member
        get :as_xlsx, on: :member, action: 'index_xlsx'
        get 'submission_count', on: :member
        delete 'inputs', on: :member, action: 'delete_inputs'
        resources :custom_fields, controller: 'phase_custom_fields', only: %i[] do
          get 'json_forms_schema', on: :collection
        end
      end

      resources :projects, concerns: %i[followable], defaults: { followable: 'Project', parent_param: :project_id } do
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
        get :as_xlsx, on: :member, action: 'index_xlsx'
        get :voting_xlsx, on: :member, action: 'voting_xlsx'
        get :voting_results_xlsx, on: :member, action: 'voting_results_xlsx'
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

      resources :custom_field_option_images, only: %i[show create update destroy], controller: :images, defaults: { container_type: 'CustomFieldOption' }

      resources :experiments, only: %i[index create]

      scope 'stats' do
        with_options controller: 'stats_users' do
          get 'users_count'
        end

        with_options controller: 'stats_ideas' do
          get 'ideas_count'

          get 'ideas_by_topic'
          get 'ideas_by_project'

          get 'ideas_by_topic_as_xlsx'
          get 'ideas_by_project_as_xlsx'
        end

        get 'initiatives_count', controller: 'stats_initiatives'

        with_options controller: 'stats_comments' do
          get 'comments_count'
          get 'comments_by_topic'
          get 'comments_by_project'

          get 'comments_by_topic_as_xlsx'
          get 'comments_by_project_as_xlsx'
        end

        with_options controller: 'stats_reactions' do
          get 'reactions_count'
          get 'reactions_by_topic'
          get 'reactions_by_project'

          get 'reactions_by_topic_as_xlsx'
          get 'reactions_by_project_as_xlsx'
        end
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

      resources :ideas_phases, only: %i[show]
    end
  end

  get '/auth/:provider/callback', to: 'omniauth_callback#create'
  post '/auth/:provider/callback', to: 'omniauth_callback#create'
  get '/auth/failure', to: 'omniauth_callback#failure'
  post '/auth/failure', to: 'omniauth_callback#failure'
  get '/auth/:provider/logout_data', to: 'omniauth_callback#logout_data'

  if Rails.env.development?
    require 'que/web'
    mount Que::Web => '/que'
  end
end
