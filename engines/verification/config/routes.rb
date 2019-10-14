Verification::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :verification_methods, only: [:index]
      post 'verification_methods/cow/verification' => 'cow_verifications#create'
    end
  end
end
