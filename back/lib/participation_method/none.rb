# frozen_string_literal: true

module ParticipationMethod
  class None < Base
    def initialize
      super(nil)
    end

    # If there is no participation method, we do not know what kind of
    # input is being created, so we cannot generate a slug based on
    # attributes of the input. So use the id as the basis for the slug.
    def assign_slug!(input)
      return if input.slug # Slugs never change.

      new_slug = SlugService.new.generate_slug input, input.id
      input.update_column :slug, new_slug
    end
  end
end
