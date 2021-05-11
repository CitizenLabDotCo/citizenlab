UserConfirmation::Engine.routes.draw do
  namespace :web_api do
    namespace :v1 do
      scope path: 'user' do
        resource :confirmation, path: :confirm, only: %i[create]
        resource :resend_code, only: %i[create]
      end
    end
  end
end


