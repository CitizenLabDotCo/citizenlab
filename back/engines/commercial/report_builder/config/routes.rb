# frozen_string_literal: true

ReportBuilder::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :reports, only: %i[index show create destroy update] do
        get :layout, on: :member
      end
    end
  end
end

Rails.application.routes.draw do
  mount ReportBuilder::Engine => ''
end
