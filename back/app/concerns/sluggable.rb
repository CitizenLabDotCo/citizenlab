# frozen_string_literal: true

module Sluggable
  extend ActiveSupport::Concern

  module ClassMethods
    attr_reader :slug_attribute, :slug_from, :slug_on

    def has_slug?
      !!@has_slug
    end

    private

    def slug(attribute: :slug, from: nil, on: nil)
      @has_slug = true
      @slug_attribute = attribute
      @slug_from ||= (from || proc { |sluggable| sluggable.id || SecureRandom.uuid })
      @slug_on ||= 42 ###
    end
  end

  included do
    validates :slug, uniqueness: true, presence: true, if: proc { self.class.has_slug? }
    before_validation :generate_slug, on: :create, if: proc { self.class.has_slug? }
  end

  def generate_slug
    self.slug ||= SlugService.new.generate_slug(
      self,
      self.class.slug_from.call(self)
    )
  end
end
