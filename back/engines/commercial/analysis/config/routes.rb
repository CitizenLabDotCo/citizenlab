# frozen_string_literal: true

Analysis::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :analyses do
        resources :inputs, only: %i[index show] do
          resource :comments_summary, only: %i[show create]
        end
        resources :tags, except: %i[show]
        resources :taggings, only: %i[index create destroy] do
          post :bulk_create, on: :collection
        end
        resources :heatmap_cells, only: %i[index]
        resources :auto_taggings, only: [:create]
        resources :background_tasks, only: %i[index show]
        resources :insights, only: %i[index destroy] do
          post :rate, on: :member
        end
        resources :summaries, only: %i[create show] do
          post :pre_check, on: :collection
          post :regenerate, on: :member
        end
        resources :questions, only: %i[create show] do
          post :pre_check, on: :collection
          post :regenerate, on: :member
        end
        resources :users, only: [:show]
        nested do
          scope 'stats', as: :stats do
            with_options controller: 'stats_users' do
              get 'authors_by_domicile'
              get 'authors_by_age'
              get 'authors_by_custom_field/:custom_field_id', action: :authors_by_custom_field
            end
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount Analysis::Engine => ''
end
