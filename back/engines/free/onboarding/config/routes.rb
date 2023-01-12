# frozen_string_literal: true

Onboarding::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope :onboarding_campaigns do
        get :current, controller: 'campaigns'
      end
    end
  end
end
