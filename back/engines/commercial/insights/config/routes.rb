# frozen_string_literal: true

Insights::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope '/insights' do
        resources :views do
          resources :categories do
            delete :index, on: :collection, action: :destroy_all
          end

          resources :inputs, only: %i[index show] do
            member do
              patch 'categories', action: :add_categories
              post 'categories', action: :replace_categories
              delete 'categories', action: :delete_categories
            end
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount Insights::Engine => ''
end
