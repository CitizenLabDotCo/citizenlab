# frozen_string_literal: true

module ParticipationMethod
  class Ideation < Base
    def validate_input(input)
      input.errors.add :idea_status, :blank if input.idea_status_id.blank?
    end

    def assign_slug(input)
      return if input.slug # Slugs never change.

      title = MultilocService.new.t input.title_multiloc, input.author
      new_slug = SlugService.new.generate_slug input, title
      input.slug = new_slug
    end

    def assign_idea_status(input)
      return if input.idea_status_id

      input.idea_status = IdeaStatus.find_by!(code: 'proposed')
    end

    def validate_built_in_fields?
      true
    end
  end
end
