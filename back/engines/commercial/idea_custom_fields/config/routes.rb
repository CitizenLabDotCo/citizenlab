IdeaCustomFields::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :projects, only: [] do
        resources :custom_fields, only: %i[index show], controller: 'idea_custom_fields' do
          patch 'by_code/:code', action: 'upsert_by_code', on: :collection
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount IdeaCustomFields::Engine => '', as: 'idea_custom_fields'
end
