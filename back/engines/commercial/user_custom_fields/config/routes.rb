UserCustomFields::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      scope :users do
        resources :custom_fields, controller: 'user_custom_fields' do
          patch 'reorder', on: :member
          get 'schema', on: :collection
          resources :custom_field_options do
            patch 'reorder', on: :member
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount UserCustomFields::Engine => ''
end