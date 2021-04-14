UserConfirmation::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      post 'users/confirm', to: 'confirmations#create'
    end
  end
end
