module MachineTranslations
  class SideFxMachineTranslationService
    include SideFxHelper

    def after_create translation, current_user
      LogActivityJob.perform_later(translation, "created", current_user, translation.created_at.to_i)
    end

    def after_update translation, current_user
      LogActivityJob.perform_later(translation, 'changed', current_user, translation.updated_at.to_i)
    end
  end
end