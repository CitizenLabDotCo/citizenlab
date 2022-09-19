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
end

Rails.application.routes.draw do
  mount IdeaCustomFields::Engine => '', as: 'idea_custom_fields'
end
