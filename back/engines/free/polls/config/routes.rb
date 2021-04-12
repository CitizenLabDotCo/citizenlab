Polls::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
    	get 'projects/:project_id/poll_questions' => 'questions#index'
    	get 'phases/:phase_id/poll_questions' => 'questions#index'
    	resources :poll_questions, only: [:create, :show, :update, :destroy], controller: :questions do
    		patch :reorder, on: :member
    		resources :poll_options, only: [:index, :create], controller: :options
  		end
  		resources :poll_options, only: [:show, :update, :destroy], controller: :options do
  			patch :reorder, on: :member
  		end
      post 'projects/:project_id/poll_responses' => 'responses#create'
      get 'projects/:project_id/poll_responses/as_xlsx' => 'responses#index_xlsx'
      get 'projects/:project_id/poll_responses/responses_count' => 'responses#responses_count'

      post 'phases/:phase_id/poll_responses' => 'responses#create'
      get 'phases/:phase_id/poll_responses/as_xlsx' => 'responses#index_xlsx'
      get 'phases/:phase_id/poll_responses/responses_count' => 'responses#responses_count'

    end
  end
end
