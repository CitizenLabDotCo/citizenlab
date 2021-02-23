CustomStatuses::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :idea_statuses, only: [:create, :update, :destroy]
    end
  end
end