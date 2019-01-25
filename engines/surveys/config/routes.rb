Surveys::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do

    end
  end

  namespace :hooks, defaults: {format: :json} do
    resources :typeform_events, only: [:create]
  end
end
