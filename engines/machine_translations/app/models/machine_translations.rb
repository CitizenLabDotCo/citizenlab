class MachineTranslations < ApplicationRecord
  belongs_to :translatable, polymorphic: true

  validates :translation, presence: true, multiloc: {presence: true}


  private
  
end
