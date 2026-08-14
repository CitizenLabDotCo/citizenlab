# frozen_string_literal: true

# Declares which multiloc attributes hold plain text. Markup is stripped from them on write, so
# nothing downstream can render one as HTML.
#
#   include PlainTextMultiloc
#   plain_text_multiloc :title_multiloc, :location_multiloc
#
# Only changed attributes are rewritten, so a save that leaves one alone cannot alter it.
#
# Reads and writes the raw attributes, so a model that overrides a reader (to fall back to a
# translation, say) still stores only what was typed.
module PlainTextMultiloc
  extend ActiveSupport::Concern

  included do
    class_attribute :plain_text_multilocs, default: [], instance_writer: false
  end

  class_methods do
    # @param prepend [Boolean] Run ahead of `Sluggable#generate_slug`, which is registered on
    #   `ApplicationRecord` and would otherwise build the slug from the raw title.
    def plain_text_multiloc(*attributes, prepend: false)
      self.plain_text_multilocs = attributes
      before_validation :strip_plain_text_multilocs, prepend: prepend
    end
  end

  private

  def strip_plain_text_multilocs
    service = SanitizationService.new

    plain_text_multilocs.each do |attribute|
      next unless self[attribute] && attribute_changed?(attribute)

      self[attribute] = service.strip_multiloc_to_plain_text(self[attribute])
    end
  end
end
