Volunteering::Engine.routes.draw do

  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'projects/:project_id/causes' => 'causes#index'
      get 'projects/:project_id/volunteers/as_xlsx' => 'volunteers#index_xlsx'
      get 'phases/:phase_id/causes' => 'causes#index'
      get 'phases/:phase_id/volunteers/as_xlsx' => 'volunteers#index_xlsx'
      resources :causes, only: [:create, :show, :update, :destroy], controller: :causes do
        patch :reorder, on: :member

        resources :volunteers, only: [:index, :create], controller: :volunteers do
          delete :destroy, on: :collection
        end
      end
    end
  end
end
