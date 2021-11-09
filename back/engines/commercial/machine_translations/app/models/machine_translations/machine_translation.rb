# == Schema Information
#
# Table name: machine_translations_machine_translations
#
#  id                :uuid             not null, primary key
#  translatable_id   :uuid             not null
#  translatable_type :string           not null
#  attribute_name    :string           not null
#  locale_to         :string           not null
#  translation       :string           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  machine_translations_lookup        (translatable_id,translatable_type,attribute_name,locale_to) UNIQUE
#  machine_translations_translatable  (translatable_id,translatable_type)
#
module MachineTranslations
  class MachineTranslation < ApplicationRecord
    belongs_to :translatable, polymorphic: true

    validates :translatable, :attribute_name, :translation, presence: true
    validates :locale_to, presence: true, inclusion: { in: CL2_SUPPORTED_LOCALES.map(&:to_s) } # , message: :unsupported_locales }


    private
    
  end
end
