# frozen_string_literal: true

Webhooks::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :webhook_subscriptions, except: %i[edit new] do
        member do
          post :regenerate_secret
        end
        resources :webhook_deliveries, only: %i[index show], shallow: true do
          member do
            post :replay
          end
        end
      end
    end
  end
end
