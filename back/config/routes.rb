# frozen_string_literal: true

Rails.application.routes.draw do
  mount UserConfirmation::Engine => '', as: 'user_confirmation'
  mount EmailCampaigns::Engine => '', as: 'email_campaigns'
  mount Frontend::Engine => '', as: 'frontend'
  mount Polls::Engine => '', as: 'polls'
  mount Seo::Engine => '', as: 'seo'
  mount Surveys::Engine => '', as: 'surveys'
  mount Volunteering::Engine => '', as: 'volunteering'

  namespace :web_api, defaults: { format: :json } do
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
          concerns: %i[votable spam_reportable],
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
        concerns: %i[votable spam_reportable post],
        defaults: { votable: 'Idea', spam_reportable: 'Idea', post: 'Idea' } do
        resources :images, defaults: { container_type: 'Idea' }
        resources :files, defaults: { container_type: 'Idea' }

        get :as_xlsx, on: :collection, action: 'index_xlsx'
        get :mini, on: :collection, action: 'index_mini'
        get 'by_slug/:slug', on: :collection, to: 'ideas#by_slug'
        get :as_markers, on: :collection, action: 'index_idea_markers'
        get :filter_counts, on: :collection
        get :schema, on: :member
        get :json_forms_schema, on: :member
      end

      resources :initiatives,
        concerns: %i[votable spam_reportable post],
        defaults: { votable: 'Initiative', spam_reportable: 'Initiative', post: 'Initiative' } do
        resources :images, defaults: { container_type: 'Initiative' }
        resources :files, defaults: { container_type: 'Initiative' }

        resources :initiative_status_changes, shallow: true, except: %i[update destroy]

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

      resources :users, only: %i[index create update destroy] do
        get 'ideas_count', on: :member
        get 'initiatives_count', on: :member
        get 'comments_count', on: :member

        resources :comments, only: [:index], controller: 'user_comments'

        collection do
          get :me
          post :complete_registration
          get :as_xlsx, action: 'index_xlsx'
          post 'reset_password_email' => 'reset_password#reset_password_email'
          post 'reset_password' => 'reset_password#reset_password'
          get 'by_slug/:slug', to: 'users#by_slug'
          get 'by_invite/:token', to: 'users#by_invite'

          resources :custom_fields, controller: 'user_custom_fields', only: %i[index show update] do
            patch 'reorder', on: :member
            get 'schema', on: :collection
            get 'json_forms_schema', on: :collection
          end
        end
      end
      get 'users/:id', to: 'users#show', constraints: { id: /\b(?!custom_fields|me)\b\S+/ }

      resources :topics do
        patch 'reorder', on: :member
      end

      resources :areas do
        patch 'reorder', on: :member
      end

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
      end

      resources :phases, only: %i[show edit update destroy] do
        resources :files, defaults: { container_type: 'Phase' }, shallow: false
        get 'survey_results', on: :member
        get :as_xlsx, on: :member, action: 'index_xlsx'
        get 'submission_count', on: :member
        delete 'inputs', on: :member, action: 'delete_inputs'
        resources :custom_fields, controller: 'phase_custom_fields', only: %i[] do
          get 'schema', on: :collection
          get 'json_forms_schema', on: :collection
        end
      end

      resources :projects do
        resources :events, only: %i[new create]
        resources :projects_allowed_input_topics, only: [:index]
        resources :phases, only: %i[index new create]
        resources :images, defaults: { container_type: 'Project' }
        resources :files, defaults: { container_type: 'Project' }
        resources :groups_projects, shallow: true, except: [:update]

        resources :custom_fields, controller: 'project_custom_fields', only: %i[] do
          get 'schema', on: :collection
          get 'json_forms_schema', on: :collection
        end

        resources :moderators, controller: 'project_moderators', except: [:update] do
          get :users_search, on: :collection
        end

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

      resources :project_folders, controller: 'folders' do
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
        get :example_xlsx, on: :collection
        get :as_xlsx, on: :collection, action: 'index_xlsx'
      end

      resource :home_page, only: %i[show update]

      scope 'stats' do
        route_params = { controller: 'stats_users' }
        get 'users_count', **route_params

        get 'users_by_time', **route_params
        get 'users_by_time_cumulative', **route_params
        get 'active_users_by_time', **route_params
        get 'active_users_by_time_cumulative', **route_params
        get 'users_engagement_scores', **route_params

        get 'users_by_time_as_xlsx', **route_params
        get 'users_by_time_cumulative_as_xlsx', **route_params
        get 'active_users_by_time_as_xlsx', **route_params

        route_params = { controller: 'stats_ideas' }
        get 'ideas_count', **route_params

        get 'ideas_by_time', **route_params
        get 'ideas_by_time_cumulative', **route_params
        get 'ideas_by_topic', **route_params
        get 'ideas_by_project', **route_params
        get 'ideas_by_status', **route_params
        get 'ideas_by_status_as_xlsx', **route_params

        get 'ideas_by_time_as_xlsx', **route_params
        get 'ideas_by_time_cumulative_as_xlsx', **route_params
        get 'ideas_by_topic_as_xlsx', **route_params
        get 'ideas_by_project_as_xlsx', **route_params

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
        get 'votes_by_topic_as_xlsx', **route_params
        get 'votes_by_project_as_xlsx', **route_params

        with_options controller: 'stats_user_fields' do
          get 'users_by_domicile'
          get 'users_by_domicile_as_xlsx'

          with_options action: :users_by_custom_field do
            get 'users_by_gender'
            get 'users_by_birthyear'
            get 'users_by_education'
            get 'users_by_custom_field/:custom_field_id'
          end

          with_options action: :users_by_custom_field_as_xlsx do
            get 'users_by_gender_as_xlsx'
            get 'users_by_birthyear_as_xlsx'
            get 'users_by_education_as_xlsx'
            get 'users_by_custom_field_as_xlsx/:custom_field_id'
          end
        end
      end

      scope 'mentions', controller: 'mentions' do
        get 'users'
      end

      scope 'action_descriptors', controller: 'action_descriptors' do
        get 'initiatives'
      end

      resources :baskets, except: [:index]

      resources :avatars, only: %i[index show]

      namespace :admin do
        resources :projects, only: [] do
          resources(
            :custom_fields,
            only: %i[index show],
            controller: 'idea_custom_fields',
            defaults: { container_type: 'Project' }
          ) do
            patch 'by_code/:code', action: 'upsert_by_code', on: :collection
            patch 'update/:id', action: 'update', on: :collection
            patch 'update_all', on: :collection
          end
        end
        resources :phases, only: [] do
          resources(
            :custom_fields,
            only: %i[index],
            controller: 'idea_custom_fields',
            defaults: { container_type: 'Phase' }
          ) do
            patch 'update_all', on: :collection
          end
        end
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
