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
      concern :spam_reportable do
        resources :spam_reports, shallow: true
      end
      concern :permissionable do
        # We named the param :permission_action, bc :action is already taken (controller action).
        resources :permissions, param: :permission_action do
          get 'requirements', on: :member
          get 'schema', on: :member
          get 'access_denied_explanation', on: :member
          patch 'reset', on: :member
          resources :permissions_custom_fields, shallow: true do
            patch 'reorder', on: :member
          end
        end
      end

      concerns :permissionable # for the global permission scope (with parent_param = nil)

      resources :activities, only: [:index]

      resources :ideas,
        concerns: %i[reactable spam_reportable followable permissionable],
        defaults: { reactable: 'Idea', spam_reportable: 'Idea', followable: 'Idea', parent_param: :idea_id } do
        resources :images, defaults: { container_type: 'Idea' }
        resources :files, defaults: { container_type: 'Idea' }
        resources :cosponsorships, defaults: { container_type: 'Idea' } do
          patch 'accept', on: :member
        end

        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get :mini, on: :collection, action: 'index_mini'
        get :survey_submissions, on: :collection, action: 'index_survey_submissions'
        get 'by_slug/:slug', on: :collection, to: 'ideas#by_slug'
        get :as_markers, on: :collection, action: 'index_idea_markers'
        get :filter_counts, on: :collection
        get :json_forms_schema, on: :member
        get 'draft/:phase_id', on: :collection, to: 'ideas#draft_by_phase'

        resources :official_feedback, shallow: true
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

        post :similar_ideas, on: :collection
        resources :authoring_assistance_responses, only: %i[create]
        get :as_xlsx, on: :member, action: 'show_xlsx'
      end

      resources :background_jobs, only: %i[index]
      resources :tracked_jobs, only: %i[index show]

      resources :jobs, only: %i[index show]

      resources :idea_statuses do
        patch 'reorder', on: :member
      end

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
        get 'comments_count', on: :member
        get 'blocked_count', on: :collection
        get 'check/:email', on: :collection, to: 'users#check', constraints: { email: /.*/ }
        scope module: 'verification' do
          get 'me/locked_attributes', on: :collection, to: 'locked_attributes#index'
        end

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
        collection do
          get 'with_visible_projects_counts', to: 'areas#with_visible_projects_counts'
        end
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

      resources :phases, only: %i[show show_mini edit update destroy], concerns: :permissionable, defaults: { parent_param: :phase_id } do
        member do
          get 'survey_results'
          get 'common_ground_results'
          get 'sentiment_by_quarter'
          get :as_xlsx, action: 'index_xlsx'
          get :mini, action: 'show_mini'
          get 'submission_count'
          get 'progress', action: 'show_progress'
          delete 'inputs', action: 'delete_inputs'
        end

        resources :inputs, only: [], controller: 'ideas' do
          post 'copy', on: :collection
        end

        resources :files, defaults: { container_type: 'Phase' }, shallow: false
        resources :custom_fields, controller: 'phase_custom_fields', only: %i[] do
          get 'json_forms_schema', on: :collection
        end
        get 'custom_form', on: :member, controller: 'custom_forms', action: 'show', defaults: { container_type: 'Phase' }
        patch 'custom_form', on: :member, controller: 'custom_forms', action: 'update', defaults: { container_type: 'Phase' }
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

        collection do
          get 'by_slug/:slug', to: 'projects#by_slug'
          get 'for_areas', action: 'index_for_areas'
          get 'for_topics', action: 'index_for_topics'
          get 'finished_or_archived', action: 'index_finished_or_archived'
          get 'for_followed_item', action: 'index_for_followed_item'
          get 'with_active_participatory_phase', action: 'index_with_active_participatory_phase'
          get 'community_monitor', action: 'community_monitor'
          get 'for_admin', action: 'index_for_admin'
        end

        resource :review, controller: 'project_reviews'

        member do
          post :copy
          post :refresh_preview_token

          get :as_xlsx, action: 'index_xlsx'
          get :votes_by_user_xlsx
          get :votes_by_input_xlsx

          delete :participation_data, action: 'destroy_participation_data'

          get 'custom_form', controller: 'custom_forms', action: 'show', defaults: { container_type: 'Project' }
          patch 'custom_form', controller: 'custom_forms', action: 'update', defaults: { container_type: 'Project' }
        end
      end

      resources :projects_allowed_input_topics, only: %i[show create destroy] do
        patch 'reorder', on: :member
      end

      resources :admin_publications, only: %i[index show] do
        patch 'reorder', on: :member
        get 'select_and_order_by_ids', on: :collection, action: 'index_select_and_order_by_ids'
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

      resources :baskets, except: [:index] do
        resources :baskets_ideas, shallow: true
      end
      put 'baskets/ideas/:idea_id', to: 'baskets_ideas#upsert'

      resources :avatars, only: %i[index show]

      resources :ideas_phases, only: %i[show]

      resources :verification_methods, module: 'verification', only: [:index] do
        get :first_enabled, on: :collection
        get :first_enabled_for_verified_actions, on: :collection
        Verification::VerificationService.new
          .all_methods
          .select { |vm| vm.verification_method_type == :manual_sync }
          .each do |vm|
          post "#{vm.name}/verification", to: 'verifications#create', on: :collection, :defaults => { method_name: vm.name }
        end
      end

      # Somewhat confusingly, custom_fields are accessed separately as a
      # resource as either user custom_fields (in separate engine) or input
      # custom_fields (nested under projects/phases). custom_field_bins and
      # custom_field_options behave exactly the same for both types of custom
      # fields, so we define them here and mount them under the otherwise empty
      # custom_fields route.
      resources :custom_fields, only: [] do
        resources :custom_field_bins, only: %i[index show], shallow: true
        resources :custom_field_options, controller: '/web_api/v1/custom_field_options', shallow: true do
          patch 'reorder', on: :member
        end
      end
    end
  end

  get '/auth/:provider/callback', to: 'omniauth_callback#create'
  post '/auth/:provider/callback', to: 'omniauth_callback#create'
  get '/auth/failure', to: 'omniauth_callback#failure'
  post '/auth/failure', to: 'omniauth_callback#failure'
  get '/auth/:provider/logout_data', to: 'omniauth_callback#logout_data'
  get '/auth/:provider/spslo', to: 'omniauth_callback#spslo'
end
