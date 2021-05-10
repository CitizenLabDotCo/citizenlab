Insights::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope '/insights' do
        resources :views, only: %i[create index show update]
      end
    end
  end
end

Rails.application.routes.draw do
  mount Insights::Engine => ''
end
