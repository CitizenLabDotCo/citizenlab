# frozen_string_literal: true

module Sluggable
  extend ActiveSupport::Concern

  SLUG_REGEX = /\A[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\z/ # Inspired by https://ihateregex.io/expr/url-slug/

  module ClassMethods
    attr_reader :slug_attribute, :slug_from, :slug_if, :slug_except

    def slug?
      !!@has_slug
    end

    private

    def slug(options = {})
      @has_slug = true
      @slug_attribute = options[:attribute] || :slug
      @slug_from ||= options[:from] || proc { |_| generate_fallback_slug }
      @slug_if = options[:if]
      @slug_except = options[:except].to_a
    end
  end

  included do
    validates :slug, uniqueness: true, presence: true, format: { with: SLUG_REGEX }, if: proc { slug_enabled? }
    before_validation :generate_slug, if: proc { slug_enabled? }
  end

  def generate_slug
    return if slug

    from_value = self.class.slug_from&.call(self)
    self.slug = SlugService.new.generate_slug(self, from_value, excluded: self.class.slug_except)
    self.slug = generate_fallback_slug if !SLUG_REGEX.match?(slug)
  end

  private

  def slug_enabled?
    self.class.slug? && (!self.class.slug_if || self.class.slug_if&.call(self))
  end

  def generate_fallback_slug
    SecureRandom.uuid
  end
end
