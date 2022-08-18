# frozen_string_literal: true

IdeaCustomFields::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      namespace :admin do
        { projects: 'Project', phases: 'Phase' }.each do |resource, container_type|
          resources resource, only: [] do
            resources(
              :custom_fields,
              only: %i[index show],
              controller: 'idea_custom_fields',
              defaults: { container_type: container_type }
            ) do
              patch 'by_code/:code', action: 'upsert_by_code', on: :collection
              patch 'update/:id', action: 'update', on: :collection
              patch 'update_all', on: :collection
            end
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount IdeaCustomFields::Engine => '', as: 'idea_custom_fields'
end
