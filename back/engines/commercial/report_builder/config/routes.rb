# frozen_string_literal: true

ReportBuilder::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :reports, only: %i[index show create destroy update] do
        member do
          get :layout
          post :copy
        end

        collection do
          resources :graph_data_units, only: %i[] do
            collection do
              get :live
              get :published
            end
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount ReportBuilder::Engine => ''
end
