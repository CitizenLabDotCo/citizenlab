Polls::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
    	get 'projects/:project_id/poll_questions' => 'questions#index'
    	get 'phases/:phase_id/poll_questions' => 'questions#index'
    	resources :poll_questions, only: [:create, :show, :update, :destroy], controller: :questions do
    		patch :reorder, on: :member
  		end
    end
  end
end
