IdIdCardLookup::Engine.routes.draw do
  namespace :admin_api, :defaults => {:format => :json} do
    scope 'verification_id_cards' do
      post :bulk_replace, controller: 'id_cards'
      get :count, controller: 'id_cards'
    end
  end
end

Rails.application.routes.draw do
  mount IdIdCardLookup::Engine => ''
end
