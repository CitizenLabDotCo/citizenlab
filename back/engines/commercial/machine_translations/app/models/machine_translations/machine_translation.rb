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

    # The translation is external-provider HTML rendered raw on the front end, so sanitize it here
    # as defence-in-depth. Running the source field's own pipeline keeps a translation from being
    # more permissive than the text it came from, without a second set of rules that could drift.
    before_validation :sanitize_translation, if: :translation

    PLAIN_TEXT_PIPELINE = ->(text) { SanitizationService.new.strip_to_plain_text(text) }

    # [translatable_type, attribute_name] -> the source field's pipeline. Every translatable field
    # is listed, so that a field's rule is always a decision someone made rather than a default.
    # Lambdas defer autoloading `Idea`/`Comment` until the callback runs.
    SOURCE_SANITIZE_PIPELINES = {
      %w[Idea title_multiloc] => PLAIN_TEXT_PIPELINE,
      %w[Idea body_multiloc] => ->(html) { SanitizationService.new.sanitize_body(html, Idea::BODY_SANITIZE_FEATURES) },
      %w[Comment body_multiloc] => ->(html) { SanitizationService.new.sanitize_body(html, Comment::BODY_SANITIZE_FEATURES) }
    }.freeze

    private

    def sanitize_translation
      pipeline = SOURCE_SANITIZE_PIPELINES[[translatable_type, attribute_name.to_s]]

      # Fall back closed: plain text is the most restrictive rule available, so an unlisted field
      # can only lose formatting, never gain markup. Report it rather than swallow it - reaching
      # here means a field became translatable without anyone choosing its rule, and if that field
      # holds HTML the translation is being silently flattened.
      if pipeline.nil?
        ErrorReporter.report_msg(
          'Machine translation of a field with no sanitize pipeline; falling back to plain text.',
          extra: { translatable_type: translatable_type, attribute_name: attribute_name }
        )
      end

      self.translation = (pipeline || PLAIN_TEXT_PIPELINE).call(translation)
    end
  end
end
