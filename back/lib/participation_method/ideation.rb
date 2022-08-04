# frozen_string_literal: true

module ParticipationMethod
  class Ideation < Base
    def assign_slug!(input)
      return if input.slug # Slugs never change.

      title = MultilocService.new.t input.title_multiloc, input.author
      input.slug = SlugService.new.generate_slug input, title
      input.save validate: false
    end

    def validate_built_in_fields?
      true
    end
  end
end
