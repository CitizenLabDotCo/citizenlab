# frozen_string_literal: true

Surveys::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      get 'phases/:phase_id/survey_responses/as_xlsx' => 'responses#index_xlsx'
    end
  end

  namespace :hooks, defaults: { format: :json } do
    resources :typeform_events, only: [:create]
  end
end
