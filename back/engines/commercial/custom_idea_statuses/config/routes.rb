# frozen_string_literal: true

CustomIdeaStatuses::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :idea_statuses, only: %i[create update destroy]
    end
  end
end

Rails.application.routes.draw do
  mount CustomIdeaStatuses::Engine => '', as: 'custom_idea_statuses'
end
