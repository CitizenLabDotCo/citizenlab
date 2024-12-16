# frozen_string_literal: true

Verification::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      # resources :verification_methods, only: [:index] do
      #   get :first_enabled, on: :collection
      #   get :first_enabled_for_verified_actions, on: :collection
      # end
      # Verification::VerificationService.new
      #   .all_methods
      #   .select { |vm| vm.verification_method_type == :manual_sync }
      #   .each do |vm|
      #   post "verification_methods/#{vm.name}/verification" => 'verifications#create', :defaults => { method_name: vm.name }
      # end
      # get 'users/me/locked_attributes' => 'locked_attributes#index'
    end
  end
end

Rails.application.routes.draw do
  mount Verification::Engine => '', as: 'verification'
end
