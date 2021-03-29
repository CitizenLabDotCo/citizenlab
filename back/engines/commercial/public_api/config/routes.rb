PublicApi::Engine.routes.draw do
  namespace :v1 do
    post 'authenticate' => "api_token#create"
    resources :ideas, only: [:index, :show]
    resources :projects, only: [:index, :show]
  end
end

Rails.application.routes.draw do
  mount PublicApi::Engine => '/api', as: 'public_api'
end
