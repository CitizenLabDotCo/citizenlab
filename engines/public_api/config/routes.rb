
PublicApi::Engine.routes.draw do

  namespace :v1 do
    resources :ideas, only: [:index, :show]
  end
  
end