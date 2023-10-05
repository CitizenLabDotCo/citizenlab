# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      concern :permissionable do
        # We named the param :permission_action, bc :action is already taken (controller action).
        resources :permissions, param: :permission_action do
          get 'requirements', on: :member
          get 'schema', on: :member
          resources :permissions_custom_fields, shallow: true
        end
      end

      concerns :permissionable # for the global permission scope (with parent_param = nil)
      resources :phases, only: [], concerns: :permissionable, defaults: { parent_param: :phase_id }
      resources :projects, only: [], concerns: :permissionable, defaults: { parent_param: :project_id }
      resources :ideas, only: [], concerns: :permissionable, defaults: { parent_param: :idea_id }
    end
  end
end
