# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def transitive?
      false
    end

    def assign_defaults(input)
      super # TODO (default status and publication status)
    end

    def budget_in_form?(_)
      false
    end

    def proposed_budget_in_form?
      false
    end

    def update_if_published?
      super # TODO (if no reviewing and no reactions + toggle)
    end

    def custom_form
      super # TODO (use transitive? and use form of phase)
    end

    def supports_publication?
      super # TODO (also include published_at for survey responses?)
    end

    def supports_status?
      super # TODO (separate proposal statuses)
    end

    def include_data_in_email?
      super # TODO (use collection methods instead)
    end
  end
end
