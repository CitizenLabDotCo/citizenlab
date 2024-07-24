# frozen_string_literal: true

CustomMaps::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :map_configs, except: %i[index] do
        post 'duplicate_map_config_and_layers', on: :member
        resources :layers, except: %i[index] do
          member do
            patch :reorder
          end
        end
      end
      resources :projects, only: [] do
        resource :map_config, except: %i[index], controller: 'project_map_configs' do
          resources :layers, except: %i[index], controller: 'project_map_config_layers' do
            member do
              patch :reorder
            end
          end
        end
      end
    end
  end
end

IdeaCustomFields::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      namespace :admin do
        resources :phases, only: [] do
          resources(
            :custom_fields,
            only: %i[index show],
            controller: 'idea_custom_fields',
            defaults: { container_type: 'Phase' }
          ) do
            get :as_geojson, on: :member, action: 'as_geojson'
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount CustomMaps::Engine => '', as: 'custom_maps'
  mount IdeaCustomFields::Engine => '', as: 'geo_idea_custom_fields'
end
