Tagging::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :tags, only: %i[index update destroy show]
      resources :taggings, only: %i[index create show destroy update]
      post 'taggings/generate' => 'taggings#generate'
    end
  end
end
