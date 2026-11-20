# frozen_string_literal: true

MachineTranslations::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      post 'machine_translations/translate_multiloc', action: :translate_multiloc, controller: 'machine_translations'
      defaults translatable_type: 'Idea' do
        get 'ideas/:idea_id/machine_translation', action: :show, controller: 'machine_translations'
      end
      defaults translatable_type: 'Comment' do
        get 'comments/:comment_id/machine_translation', action: :show, controller: 'machine_translations'
      end
    end
  end
end

Rails.application.routes.draw do
  mount MachineTranslations::Engine => ''
end
