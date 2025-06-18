# frozen_string_literal: true

IdeaCustomFields::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :projects, only: [] do
        resources(
          :custom_fields,
          only: %i[index show],
          controller: 'idea_custom_fields',
          defaults: { container_type: 'Project' }
        ) do
          patch 'update_all', on: :collection
          resources :custom_field_matrix_statements, controller: '/web_api/v1/custom_field_matrix_statements', only: %i[index show]
        end
      end
      resources :phases, only: [] do
        resources(
          :custom_fields,
          only: %i[index show],
          controller: 'idea_custom_fields',
          defaults: { container_type: 'Phase' }
        ) do
          patch 'update_all', on: :collection
          get :as_geojson, on: :member, action: 'as_geojson'
          resources :custom_field_matrix_statements, controller: '/web_api/v1/custom_field_matrix_statements', only: %i[index show]
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount IdeaCustomFields::Engine => '', as: 'idea_custom_fields'
end
