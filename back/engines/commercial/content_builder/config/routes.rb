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
      resources :static_pages, only: [] do
        resources :content_builder_layouts, param: :code, only: %i[show destroy], defaults: { content_buildable: 'StaticPage' } do
          post :upsert, on: :member
        end
      end
      scope 'home_pages' do
        resources :content_builder_layouts, param: :code, only: %i[show destroy], defaults: { content_buildable: 'HomePage' } do
          post :upsert, on: :member
        end
      end
      resources :content_builder_layout_images, only: :create, controller: :layout_images

      # A layout pins {blockId, version}, so a placed block only ever reads one
      # version: its metadata and its bundle. Blocks are written by the report
      # generation loop, never through the API, so there is nothing else to expose.
      resources :custom_blocks, only: [] do
        get 'versions/:number', to: 'custom_block_versions#show', constraints: { number: /\d+/ }
        get 'versions/:number/bundle', to: 'custom_block_versions#bundle', constraints: { number: /\d+/ }
      end
      resources :reporting_queries, only: %i[create]
      # Replaces every stored answer a layout holds. Keyed by layout, because the
      # layout is what asks the questions.
      post 'content_builder_layouts/:layout_id/refresh_snapshots',
        to: 'reporting_queries#refresh'
    end
  end
end

Rails.application.routes.draw do
  mount ContentBuilder::Engine => ''
end
