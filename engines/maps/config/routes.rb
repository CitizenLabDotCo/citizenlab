Maps::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :projects, only: [] do
        resource :map_config, only: %i[show] do
          resources :layers, only: %i[show]
        end
      end
    end
  end
end
