CustomizableNavbar::Engine.routes.draw do
  namespace :web_api, :defaults => { :format => :json } do
    namespace :v1 do
      resources :nav_bar_items
    end
  end
end

Rails.application.routes.draw do
  mount CustomizableNavbar::Engine => ''
end
