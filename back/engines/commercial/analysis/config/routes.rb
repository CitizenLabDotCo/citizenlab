# frozen_string_literal: true

Analysis::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :analyses, except: %i[update] do
        resources :tags, except: %i[show]
        resources :inputs, only: [:index]
      end
    end
  end
end

Rails.application.routes.draw do
  mount Analysis::Engine => ''
end
