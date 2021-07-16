Moderation::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :moderations, only: [:index] do
        patch ':moderatable_type/:moderatable_id' => 'moderations#update', on: :collection
        get 'moderations_count', on: :collection
      end
    end
  end
end

Rails.application.routes.draw do
  mount Moderation::Engine => ''
end
