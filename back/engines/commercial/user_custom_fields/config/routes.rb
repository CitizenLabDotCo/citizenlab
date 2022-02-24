UserCustomFields::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      scope :users do
        resources :custom_fields, controller: 'user_custom_fields' do
          patch 'reorder', on: :member
          get 'schema', on: :collection
          get 'json_forms_schema', on: :collection
          resources :custom_field_options, controller: '/web_api/v1/custom_field_options' do
            patch 'reorder', on: :member
          end
        end
      end

      scope 'stats' do
        route_params = {controller: 'stats_users'}

        get 'users_by_gender', **route_params
        get 'users_by_birthyear', **route_params
        get 'users_by_domicile', **route_params
        get 'users_by_education', **route_params
        get 'users_by_custom_field/:custom_field_id', action: :users_by_custom_field, **route_params

        get 'users_by_gender_as_xlsx', **route_params
        get 'users_by_birthyear_as_xlsx', **route_params
        get 'users_by_domicile_as_xlsx', **route_params
        get 'users_by_education_as_xlsx', **route_params
        get 'users_by_custom_field_as_xlsx/:custom_field_id', action: :users_by_custom_field_as_xlsx, **route_params
      end
    end
  end
end

Rails.application.routes.draw do
  mount UserCustomFields::Engine => ''
end