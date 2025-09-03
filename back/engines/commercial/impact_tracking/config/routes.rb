# frozen_string_literal: true

ImpactTracking::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :sessions, only: %i[create] do
        patch :upgrade, on: :member
        post 'track_pageview' => 'pageviews#create', on: :member
      end
    end
  end
end

Rails.application.routes.draw do
  mount ImpactTracking::Engine => ''
end
