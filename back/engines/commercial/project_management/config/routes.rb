ProjectManagement::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :projects, only: [] do
        resources :moderators, except: [:update] do
          get :users_search, on: :collection
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount ProjectManagement::Engine => ''
end

