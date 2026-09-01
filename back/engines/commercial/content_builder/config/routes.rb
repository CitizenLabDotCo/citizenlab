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

      resources :custom_blocks, only: %i[index show create update destroy] do
        resources :versions, only: %i[index create], controller: 'custom_block_versions'
        get 'versions/:number/bundle', to: 'custom_block_versions#bundle', constraints: { number: /\d+/ }
        resources :ai_sessions, only: :create, controller: 'custom_block_ai_sessions'
      end
      post 'custom_block_ai_sessions/:id/turns', to: 'custom_block_ai_sessions#create_turn'
    end
  end
end

Rails.application.routes.draw do
  mount ContentBuilder::Engine => ''
end
