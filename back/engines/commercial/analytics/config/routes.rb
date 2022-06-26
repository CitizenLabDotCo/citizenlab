Analytics::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope '/analytics' do
        resources :posts, :participations
      end
    end
  end
end

Rails.application.routes.draw do
  mount Analytics::Engine => ''
end
