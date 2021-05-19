Insights::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope '/insights' do
        resources :views do
          resources :categories
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount Insights::Engine => ''
end
