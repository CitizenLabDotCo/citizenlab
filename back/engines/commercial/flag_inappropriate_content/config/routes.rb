FlagInappropriateContent::Engine.routes.draw do
  namespace :web_api, :defaults => { :format => :json } do
    namespace :v1 do
      resources :inappropriate_content_flags, only: %i[show] do
        patch 'mark_as_deleted', on: :member
        patch 'mark_as_flagged', on: :member
      end
    end
  end
end

Rails.application.routes.draw do
  mount FlagInappropriateContent::Engine => '', as: 'inappropriate_content_flags'
end
