# frozen_string_literal: true

UserCustomFields::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope :users do
        resources :custom_fields, controller: 'user_custom_fields' do
          patch 'reorder', on: :member
          get 'schema', on: :collection
          get 'json_forms_schema', on: :collection
          resources :custom_field_options, controller: '/web_api/v1/custom_field_options' do
            patch 'reorder', on: :member
          end

          resource :reference_distribution, controller: 'ref_distributions', only: %i[show create destroy]
        end
      end

      scope 'stats' do
        with_options controller: 'stats_users' do
          get 'users_by_domicile'

          with_options action: :users_by_custom_field do
            get 'users_by_gender'
            get 'users_by_birthyear'
            get 'users_by_education'
            get 'users_by_custom_field/:custom_field_id'
          end

          get 'users_by_gender_as_xlsx'
          get 'users_by_birthyear_as_xlsx'
          get 'users_by_domicile_as_xlsx'
          get 'users_by_education_as_xlsx'
          get 'users_by_custom_field_as_xlsx/:custom_field_id', action: :users_by_custom_field_as_xlsx
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount UserCustomFields::Engine => ''
end
