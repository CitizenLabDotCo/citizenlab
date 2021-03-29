Clusterings::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :clusterings
    end
  end
end

Rails.application.routes.draw do
  mount Clusterings::Engine => "", as: 'clusterings'
end
