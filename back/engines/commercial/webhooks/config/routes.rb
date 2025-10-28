# frozen_string_literal: true

Webhooks::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :webhook_subscriptions, except: [:edit, :new] do
        member do
          post :test
          post :regenerate_secret
        end
        resources :webhook_deliveries, only: [:index, :show] do
          member do
            post :retry
          end
        end
      end
    end
  end
end
