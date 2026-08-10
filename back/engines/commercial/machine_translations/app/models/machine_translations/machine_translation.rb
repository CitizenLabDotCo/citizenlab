# frozen_string_literal: true

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

    # The translation is external-provider HTML rendered raw on the front end, so sanitize it
    # here as defence-in-depth. The allowlist is derived from the source field's own rules so a
    # translation is never more permissive than the text it was translated from.
    before_validation :sanitize_translation, if: :translation

    # Maps [translatable_type, attribute_name] to the source field's SanitizationService features.
    # Anything not listed (titles, unknown attributes) is treated as plain text and fully stripped.
    SOURCE_SANITIZE_FEATURES = {
      %w[Idea body_multiloc] => -> { Idea::BODY_SANITIZE_FEATURES },
      %w[Comment body_multiloc] => -> { Comment::BODY_SANITIZE_FEATURES }
    }.freeze

    private

    def sanitize_translation
      features_proc = SOURCE_SANITIZE_FEATURES[[translatable_type, attribute_name.to_s]]
      self.translation =
        if features_proc
          SanitizationService.new.sanitize(translation, features_proc.call)
        else
          ActionView::Base.full_sanitizer.sanitize(translation)
        end
    end
  end
end
