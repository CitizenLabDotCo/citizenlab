# frozen_string_literal: true

module Sluggable
  extend ActiveSupport::Concern

  module ClassMethods
    # TODO: Validate chars + spec
    # TODO: Migration script
    attr_reader :slug_attribute, :slug_from, :slug_if

    def slug?
      !!@has_slug
    end

    private

    def slug(options = {})
      @has_slug = true
      @slug_attribute = options[:attribute] || :slug
      @slug_from ||= (options[:from] || proc { |sluggable| sluggable.id || SecureRandom.uuid })
      @slug_if = options[:if]
    end
  end

  included do
    validates :slug, uniqueness: true, presence: true, if: proc { self.class.slug? && slug_if? } # TODO: Check valid chars + spec
    before_validation :generate_slug, if: proc { self.class.slug? }
  end

  def generate_slug
    return if slug || !slug_if?

    from_value = self.class.slug_from.call(self)
    self.slug = SlugService.new.generate_slug self, from_value
  end

  def slug_if?
    !self.class.slug_if || self.class.slug_if&.call(self)
  end
end
