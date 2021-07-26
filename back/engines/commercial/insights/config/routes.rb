# frozen_string_literal: true

Insights::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope '/insights' do
        resources :views do
          resources :categories do
            delete :index, on: :collection, action: :destroy_all
          end

          resources :inputs, only: %i[index show] do
            resources :categories, only: %i[index destroy], controller: 'category_assignments' do
              collection do
                # Adds POST & DELETE endpoints at the collection level without
                # an extra path component. It matches:
                # - POST  .../inputs/:input_id/categories
                # - DELETE .../inputs/:input_id/categories
                post :index, action: :add_categories
                delete :index, action: :delete_categories
              end
            end

            resources :suggested_categories, only: %i[index destroy], controller: 'category_suggestions' do
              delete :index, on: :collection, action: :delete_suggestions
            end

            post :processed_flag, controller: 'processed_flags', action: :create
          end

          resource :network, only: %i[show]
          
          nested do
            scope '/tasks' do
              resources :category_suggestions, controller: 'classification_tasks', only: %i[index create destroy] do
                delete :index, on: :collection, action: :destroy_all
              end
            end

            scope '/batch' do
              post :assign_categories, controller: 'batch_assignments'
              post :remove_categories, controller: 'batch_assignments'
            end

            scope '/stats' do
              get :inputs_count, controller: 'stats_inputs', action: :inputs_count
            end
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount Insights::Engine => ''
end
