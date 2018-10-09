EmailCampaigns::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :campaigns do
        post :send, action: :do_send, on: :member
        post :send_preview, on: :member
        get :preview, on: :member
        get :deliveries, on: :member
        get :stats, on: :member
      end

      resources :users, only: [] do
        resources :consents, only: [:index, :update], shallow: true
      end
    end
  end

  namespace :hooks, defaults: {format: :json} do
    resources :mailgun_events, only: [:create]
  end
end
