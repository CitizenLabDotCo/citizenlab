GeographicDashboard::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope path: '/ideas' do
        resources :geotagged, only: %i[index], controller: 'geotagged_ideas'
      end
    end
  end
end

Rails.application.routes.draw do
  mount GeographicDashboard::Engine => '', as: 'geographic_dashboard'
end
