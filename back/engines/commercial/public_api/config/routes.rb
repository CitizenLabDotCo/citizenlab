PublicApi::Engine.routes.draw do
  namespace :v1 do
    post 'authenticate' => 'api_token#create'
    resources :ideas, only: %i[index show]
    resources :projects, only: %i[index show]
  end
end

Rails.application.routes.draw do
  mount PublicApi::Engine => '/api', as: 'public_api'
end
