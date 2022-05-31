# frozen_string_literal: true

Texting::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :campaigns, path: 'texting_campaigns' do
        member do
          post :send, action: :do_send
          post :mark_as_sent
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount Texting::Engine => ''
end
