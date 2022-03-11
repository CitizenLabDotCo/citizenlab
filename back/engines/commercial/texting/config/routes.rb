Texting::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :campaigns, path: 'texting_campaigns'
    end
  end
end

Rails.application.routes.draw do
  mount Texting::Engine => ''
end
