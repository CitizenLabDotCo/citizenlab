CustomMaps::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :projects, only: [] do
        resource :map_config, except: %i[show index] do
          resources :layers, except: %i[show index] do
            member do
              patch :reorder
            end
          end
        end
      end
    end
  end
end
