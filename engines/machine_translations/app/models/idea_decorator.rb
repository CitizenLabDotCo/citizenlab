Idea.class_eval do

  has_many :machine_translations, as: :translatable, class_name: 'MachineTranslations::MachineTranslation', dependent: :destroy

end