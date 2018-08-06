PublicApi::Engine.routes.draw do

  namespace :v1 do
    post 'authenticate' => "api_token#create"
    resources :ideas, only: [:index, :show]
    resources :projects, only: [:index, :show]

    match 'manifest.json', to: 'manifest#show', via: :get
  end
  
end