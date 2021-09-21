Navbar::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :navbar_items, only: :update
    end
  end
end

Rails.application.routes.draw do
  mount Navbar::Engine => ''
end
