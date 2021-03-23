# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :permissions, only: [], param: :permission_action do
        resources :participation_conditions, only: :index, module: :permissions
      end

      concern :permissionable do
        # :action is already used as param, so we chose :permission_action instead
        resources :permissions, only: [], param: :permission_action do
          resources :permissionable, only: :index, module: :permissions
        end
      end

      concerns :permissionable

      resources :phases,
                only: [],
                concerns: :permissionable,
                defaults: { parent_param: :phase_id }

      resources :projects,
                only: [],
                concerns: :permissionable,
                defaults: { parent_param: :project_id }
    end
  end
end
