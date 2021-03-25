require 'active_support/concern'

module MachineTranslations::Concerns::Translatable
  extend ActiveSupport::Concern

  included do
    has_many :machine_translations, as: :translatable, class_name: 'MachineTranslations::MachineTranslation', dependent: :destroy
  end

end