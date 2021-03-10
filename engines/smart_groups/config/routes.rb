SmartGroups::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :permissions, only: [], param: :permission_action do
        resources :participation_conditions, only: :index, module: :permissions
      end

      concern :participation_context_conditions do
        # :action is already used as param, so we chose :permission_action instead
        resources :permissions, only: [], param: :permission_action do
          resources :participation_conditions, only: :index, module: :permissions
        end
      end

      resources :phases, only: [], concerns: :participation_context_conditions, defaults: { parent_param: :phase_id }
      resources :projects, only: [], concerns: :participation_context_conditions, defaults: { parent_param: :project_id }
    end
  end
end
