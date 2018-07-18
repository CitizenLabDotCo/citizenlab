EmailCampaigns::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :campaigns do
        post 'send', action: :do_send, on: :member
      end
    end
  end
end
