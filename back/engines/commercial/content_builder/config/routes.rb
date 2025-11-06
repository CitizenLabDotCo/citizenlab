# frozen_string_literal: true

ContentBuilder::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      resources :projects, only: [] do
        resources :content_builder_layouts, param: :code, only: %i[show destroy], defaults: { content_buildable: 'Project' } do
          post :upsert, on: :member
        end
      end
      resources :project_folders, only: [] do
        resources :content_builder_layouts, param: :code, only: %i[show destroy], defaults: { content_buildable: 'ProjectFolder' } do
          post :upsert, on: :member
        end
      end
      scope 'home_pages' do
        resources :content_builder_layouts, param: :code, only: %i[show destroy], defaults: { content_buildable: 'HomePage' } do
          post :upsert, on: :member
        end
      end
      resources :content_builder_layout_images, only: :create, controller: :layout_images
    end
  end
end

Rails.application.routes.draw do
  mount ContentBuilder::Engine => ''
end
