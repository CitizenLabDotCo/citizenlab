Frontend::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      match 'manifest.json', to: 'manifest#show', via: :get
    end
  end

end
