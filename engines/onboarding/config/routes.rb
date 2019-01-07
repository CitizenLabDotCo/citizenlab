Onboarding::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resource :onboarding_status, only: [:show]
    end
  end

end
