UserCustomFields::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
    end
  end
end

Rails.application.routes.draw do
  mount UserCustomFields::Engine => ''
end