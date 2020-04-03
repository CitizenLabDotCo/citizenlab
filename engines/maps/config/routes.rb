Maps::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'projects/:project_id/map_config' => 'map_configs#show'
    end
  end
end
