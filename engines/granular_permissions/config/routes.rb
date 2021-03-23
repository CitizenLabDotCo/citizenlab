# frozen_string_literal: true

GranularPermissions::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      concern :permission_conditionable do
        # We named the param :permission_action, bc :action is already taken (controller action).
        resources :permissions, param: :action, only: [] do
          resources :participation_conditions, only: :index, module: :permissions
        end
      end

      concerns :permission_conditionable  # for the global permission scope (with parent_param = nil)
      resources :phases, only: [], concerns: :permission_conditionable, defaults: { parent_param: :phase_id }
      resources :projects, only: [], concerns: :permission_conditionable, defaults: { parent_param: :project_id }
    end
  end
end

Rails.application.routes.draw do
  mount GranularPermissions::Engine => '', as: 'granular_permissions'
end
