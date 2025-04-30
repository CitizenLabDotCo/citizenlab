# frozen_string_literal: true

UserCustomFields::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      scope :users do
        resources :custom_fields, controller: 'user_custom_fields' do
          patch 'reorder', on: :member

          resource :reference_distribution, controller: 'ref_distributions', only: %i[show create destroy]
          resource :rscore, controller: 'r_scores', only: %i[show]
        end
      end

      scope 'stats' do
        with_options controller: 'stats_users' do
          get 'users_by_age'
          get 'users_by_age_as_xlsx'

          with_options action: :users_by_custom_field do
            get 'users_by_custom_field/:custom_field_id'
          end

          with_options action: :users_by_custom_field_as_xlsx do
            get 'users_by_custom_field_as_xlsx/:custom_field_id'
          end
        end
      end
    end
  end
end

Rails.application.routes.draw do
  mount UserCustomFields::Engine => ''
end
