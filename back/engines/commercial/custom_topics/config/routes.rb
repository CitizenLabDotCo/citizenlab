CustomTopics::Engine.routes.draw do
  namespace :web_api, :defaults => { :format => :json } do
    namespace :v1 do
      resources :topics, only: %i[create update destroy] do
        patch 'reorder', on: :member
      end
    end
  end
end

Rails.application.routes.draw do
  mount CustomTopics::Engine => '', as: 'custom_topics'
end
