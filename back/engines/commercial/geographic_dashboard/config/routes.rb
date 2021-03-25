GeographicDashboard::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope path: '/ideas' do
        resources :geotagged, only: %i[index], controller: 'geotagged_ideas'
      end
    end
  end
end
