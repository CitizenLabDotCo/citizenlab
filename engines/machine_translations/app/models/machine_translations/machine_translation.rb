module MachineTranslations
  class MachineTranslation < ApplicationRecord
    belongs_to :translatable, polymorphic: true

    validates :translation, presence: true


    private
    
  end
end
