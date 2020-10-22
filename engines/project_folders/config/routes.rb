ProjectFolders::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :project_folders do
        resources :images, defaults: {container_type: 'ProjectFolder'}
        resources :files, defaults: {container_type: 'ProjectFolder'}
        get 'by_slug/:slug', on: :collection, to: 'project_folders#by_slug'
      end
    end
  end
end
