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
    # here as defence-in-depth. Rather than reproduce a set of rules that could drift, run the
    # translation through the source field's own pipeline: a translation is then never more
    # permissive than the text it was translated from, and never loses markup the source keeps.
    before_validation :sanitize_translation, if: :translation

    # Maps [translatable_type, attribute_name] to the source field's sanitization pipeline.
    # Anything not listed is treated as plain text and fully stripped.
    #
    # These mirror `Idea#sanitize_body_multiloc` and `Comment#sanitize_body_multiloc`. The
    # linkify step matters: both models sanitize *before* linkifying, so their stored bodies
    # legitimately contain Rinku anchors that the allowlist alone would strip back out. It also
    # rewrites any anchor the provider returned to point at its own visible text, which is what
    # stops a translation from carrying a link whose destination and label disagree.
    #
    # Wrapping in lambdas defers autoloading `Idea`/`Comment` until the callback runs.
    SOURCE_SANITIZE_PIPELINES = {
      %w[Idea body_multiloc] => ->(html) { sanitize_body(html, Idea::BODY_SANITIZE_FEATURES) },
      %w[Comment body_multiloc] => ->(html) { sanitize_body(html, Comment::BODY_SANITIZE_FEATURES) }
    }.freeze

    def self.sanitize_body(html, features)
      service = SanitizationService.new
      html = service.sanitize(html, features)
      html = service.remove_empty_trailing_tags(html)
      service.linkify(html)
    end
    private_class_method :sanitize_body

    private

    def sanitize_translation
      pipeline = SOURCE_SANITIZE_PIPELINES[[translatable_type, attribute_name.to_s]]
      self.translation =
        if pipeline
          pipeline.call(translation)
        else
          SanitizationService.new.strip_to_plain_text(translation)
        end
    end
  end
end
