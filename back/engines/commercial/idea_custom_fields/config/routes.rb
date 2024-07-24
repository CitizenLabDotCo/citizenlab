# frozen_string_literal: true

IdeaCustomFields::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      namespace :admin do
        resources :projects, only: [] do
          resources(
            :custom_fields,
            only: %i[index show],
            controller: 'idea_custom_fields',
            defaults: { container_type: 'Project' }
          ) do
            patch 'update_all', on: :collection
            resources :custom_field_options, controller: '/web_api/v1/custom_field_options', only: %i[show]
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
            resources :custom_field_options, controller: '/web_api/v1/custom_field_options', only: %i[show]
            get :as_geojson, on: :member, action: 'as_geojson'
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount IdeaCustomFields::Engine => '', as: 'idea_custom_fields'
end
