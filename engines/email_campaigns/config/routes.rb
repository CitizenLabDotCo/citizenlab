EmailCampaigns::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :campaigns
    end
  end
end
