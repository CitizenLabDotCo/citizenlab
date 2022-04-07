ContentBuilder::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :projects, only: [] do
        resources :content_builder_layouts, param: :code, only: %i[show destroy] do
          post :upsert, on: :member
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount ContentBuilder::Engine => ''
end
