# frozen_string_literal: true

Analytics::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :analytics, only: %i[index create]
      get 'analytics/schema/:fact', to: 'analytics#schema'
    end
  end
end

Rails.application.routes.draw do
  mount Analytics::Engine => ''
end
