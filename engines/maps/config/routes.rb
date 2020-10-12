Maps::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'projects/:project_id/map_config' => 'map_configs#show'
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
