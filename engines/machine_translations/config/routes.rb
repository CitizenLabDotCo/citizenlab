MachineTranslations::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      defaults translatable: 'Idea' do
        get 'ideas/:idea_id/machine_translation', action: :show, controller: 'machine_translations'
      end
      defaults translatable: 'Initiative' do
        get 'initiatives/:initiative_id/machine_translation', action: :show, controller: 'machine_translations'
      end
      defaults translatable: 'Comment' do
        get 'comments/:comment_id/machine_translation', action: :show, controller: 'machine_translations'
      end
    end
  end
end