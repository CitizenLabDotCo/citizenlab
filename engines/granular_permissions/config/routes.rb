# frozen_string_literal: true

GranularPermissions::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      concern :permissionable do
        # We named the param :permission_action, bc :action is already taken (controller action).
        resources :permissions, param: :permission_action, only: [] do
          resources :participation_conditions, only: :index, module: :permissions
        end
      end

      concerns :permissionable  # for the global permission scope (with parent_param = nil)
      resources :phases, only: [], concerns: :permissionable, defaults: { parent_param: :phase_id }
      resources :projects, only: [], concerns: :permissionable, defaults: { parent_param: :project_id }
    end
  end
end

Rails.application.routes.draw do
  mount GranularPermissions::Engine => '', as: 'granular_permissions'
end
