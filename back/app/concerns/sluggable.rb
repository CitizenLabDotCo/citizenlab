# frozen_string_literal: true

module Sluggable
  extend ActiveSupport::Concern

  module ClassMethods
    # TODO: Test for this concern
    # TODO: Apply everywhere
    # TODO: SlugService only here? (delete service?) -> Keep for now
    # TODO: Migration script
    attr_reader :slug_attribute, :slug_from, :slug_on

    def has_slug?
      !!@has_slug
    end

    private

    def slug(attribute: :slug, from: nil, on: nil)
      @has_slug = true
      @slug_attribute = attribute
      @slug_from ||= (from || proc { |sluggable| sluggable.id || SecureRandom.uuid })
      @slug_on ||= on
    end
  end

  included do
    validates :slug, uniqueness: true, presence: true, if: proc { self.class.has_slug? } # TODO: Check valid chars + spec
    before_validation :generate_slug, on: slug_on, if: proc { self.class.has_slug? }
  end

  def generate_slug
    self.slug ||= SlugService.new.generate_slug(
      self,
      self.class.slug_from.call(self)
    )
  end
end
