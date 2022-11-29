# frozen_string_literal: true

module ParticipationMethod
  class Ideation < Base
    # This method is invoked after creation of the input,
    # so store the new slug.
    def assign_slug(input)
      title = MultilocService.new.t input.title_multiloc, input.author
      new_slug = SlugService.new.generate_slug input, title
      input.update_column :slug, new_slug
    end

    def assign_defaults(input)
      input.idea_status ||= IdeaStatus.find_by!(code: 'proposed')
    end

    def validate_built_in_fields?
      true
    end

    def supports_publication?
      true
    end

    def supports_commenting?
      true
    end

    def supports_voting?
      true
    end

    def supports_baskets?
      true
    end

    def supports_status?
      true
    end

    def supports_assignment?
      true
    end

    def supports_toxicity_detection?
      true
    end

    def sign_in_required_for_posting?
      true
    end

    def include_data_in_email?
      true
    end
  end
end
