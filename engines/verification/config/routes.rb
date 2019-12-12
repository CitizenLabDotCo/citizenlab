Verification::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :verification_methods, only: [:index]
      Verification::VerificationService.new
        .all_methods
        .select{|vm| vm.veritication_method_type == :manual_sync}
        .each do |vm|
        post "verification_methods/#{vm.name}/verification" => "verifications#create", :defaults => { :method_name => vm.name }
      end
    end
  end
  namespace :admin_api, :defaults => {:format => :json} do
    scope 'verification_id_cards' do
      post :bulk_replace, controller: 'id_cards'
      get :count, controller: 'id_cards'
    end
  end
end
