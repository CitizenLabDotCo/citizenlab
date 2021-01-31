Maps::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :projects, only: [] do
        resource :map_config, except: %i[index] do
          resources :layers, except: %i[except] do
            member do
              patch :reorder
            end
          end
        end
      end
    end
  end

  namespace :admin_api, :defaults => {:format => :json} do
    resources :projects, only: [] do
      resource :map_config, only: [:show, :update, :destroy] do
        resources :layers, only: [:create, :destroy, :index, :show]
      end
    end
  end
end
