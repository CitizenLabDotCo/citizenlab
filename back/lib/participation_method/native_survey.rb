# frozen_string_literal: true

module ParticipationMethod
  class NativeSurvey < Base
    # Survey responses do not have a fixed field that can be used
    # to generate a slug, so use the id as the basis for the slug.
    # This method is invoked after creation of the input,
    # so store the new slug.
    def assign_slug(input)
      new_slug = SlugService.new.generate_slug input, input.id
      input.update_column :slug, new_slug
    end

    def assign_defaults(input)
      input.publication_status = 'published'
      input.idea_status = IdeaStatus.find_by!(code: 'proposed')
    end
  end
end
