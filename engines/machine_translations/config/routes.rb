MachineTranslations::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :machine_translations, only: [:show]
    end
  end
end