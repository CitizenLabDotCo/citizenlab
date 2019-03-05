Frontend::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      match 'manifest.json', to: 'manifest#show', via: :get
      resources :product_feedback, only: [:create]
    end
  end

end
