# frozen_string_literal: true

ReportBuilder::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :reports, only: %i[index show create destroy update] # :only is probably not necessary
    end
  end
end

Rails.application.routes.draw do
  mount ReportBuilder::Engine => ''
end
