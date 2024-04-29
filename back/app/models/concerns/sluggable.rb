# frozen_string_literal: true

module Sluggable
  extend ActiveSupport::Concern

  SLUG_REGEX = /\A[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\z/ # Inspired by https://ihateregex.io/expr/url-slug/

  module ClassMethods
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
    validates :slug, uniqueness: true, presence: true, format: { with: SLUG_REGEX }, if: proc { enabled? }
    before_validation :generate_slug, if: proc { enabled? }
  end

  def generate_slug
    return if slug

    from_value = self.class.slug_from.call(self)
    self.slug = SlugService.new.generate_slug self, from_value
  end

  private

  def enabled?
    self.class.slug? && (!self.class.slug_if || self.class.slug_if&.call(self))
  end
end
