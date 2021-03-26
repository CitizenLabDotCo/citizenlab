Surveys::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'projects/:participation_context_id/survey_responses/as_xlsx' => 'responses#index_xlsx', defaults: {pc_class: Project}
      get 'phases/:participation_context_id/survey_responses/as_xlsx' => 'responses#index_xlsx', defaults: {pc_class: Phase}
    end
  end

  namespace :hooks, defaults: {format: :json} do
    resources :typeform_events, only: [:create]
  end
end
