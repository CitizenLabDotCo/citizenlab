# frozen_string_literal: true

module ParticipationMethod
  class Ideation < Base
    def assign_slug!(input)
      return if input.slug # Slugs never change.

      title = MultilocService.new.t input.title_multiloc, input.author
      new_slug = SlugService.new.generate_slug input, title
      input.update_column :slug, new_slug
    end

    def validate_built_in_fields?
      true
    end
  end
end
