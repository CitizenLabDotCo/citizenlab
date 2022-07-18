# frozen_string_literal: true

Analytics::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope '/analytics' do
        resources :posts, only: :create
        resources :participations, only: :create
      end
    end
  end
end

Rails.application.routes.draw do
  mount Analytics::Engine => ''
end
