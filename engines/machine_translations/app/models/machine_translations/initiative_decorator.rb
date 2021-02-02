module MachineTranslations::InitiativeDecorator
  extend ActiveSupport::Concern

  included do
    has_many :machine_translations, as: :translatable, class_name: 'MachineTranslations::MachineTranslation', dependent: :destroy
  end

end