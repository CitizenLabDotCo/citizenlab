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

    # Provider HTML, rendered raw on the front end. Running the source field's own pipeline keeps a
    # translation from being more permissive than the text it was translated from. Links in a comment
    # body are the one exception, for the reason given on that pipeline.
    before_validation :sanitize_translation, if: :translation

    PLAIN_TEXT_PIPELINE = ->(text) { SanitizationService.new.strip_to_plain_text(text) }

    # [translatable_type, attribute_name] -> the source field's pipeline. Every translatable field is
    # listed, so a field's rule is always a choice rather than a default. Lambdas defer autoloading
    # `Idea`/`Comment` until the callback runs.
    SOURCE_SANITIZE_PIPELINES = {
      %w[Idea title_multiloc] => PLAIN_TEXT_PIPELINE,
      %w[Idea body_multiloc] => ->(html) { SanitizationService.new.sanitize_body(html, Idea::BODY_SANITIZE_FEATURES) },
      # A comment body omits `:link`, so its own rule rebuilds every link from the visible text and a
      # reader always sees where a link goes. A provider translates that text, leaving the rule
      # nothing to find and the link deleted. Put each URL back as its own text first, so the same
      # rule runs on a translation and still returns a link that shows its own address.
      %w[Comment body_multiloc] => lambda { |html|
        service = SanitizationService.new
        service.sanitize_body(service.replace_links_with_urls(html), Comment::BODY_SANITIZE_FEATURES)
      }
    }.freeze

    private

    def sanitize_translation
      pipeline = SOURCE_SANITIZE_PIPELINES[[translatable_type, attribute_name.to_s]]

      # Fall back closed - plain text can only lose formatting, never permit markup - but report it:
      # reaching here means a field became translatable without anyone choosing its rule.
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
