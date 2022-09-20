# frozen_string_literal: true

module ParticipationMethod
  class NativeSurvey < Base
    # Survey responses do not have a fixed field that can be used
    # to generate a slug, so it has to be set after creation.
    # Use the id as the slug.
    def assign_slug!(input)
      return if input.slug # Slugs never change.

      input.update_column :slug, input.id
    end
  end
end
