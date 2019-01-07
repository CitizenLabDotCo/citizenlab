Onboarding::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      scope :onboarding_campaigns do
        get :current, controller: 'campaigns'
        post :':campaign_id/dismissal', controller: 'campaign_dismissals', action: 'create'
      end
    end
  end

end
