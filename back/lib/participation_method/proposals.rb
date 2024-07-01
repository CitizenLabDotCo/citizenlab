# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def transitive?
      false
    end

    def default_fields(custom_form)
      super # TODO (default status and publication status)
    end

    def constraints
      super # TODO (remove proposed_budget)
    end

    def create_default_form!
      super # TODO (link to phase instead of project)
    end

    def budget_in_form?(_)
      false
    end

    def proposed_budget_in_form?(_)
      false # TODO (add everywhere else)
    end

    def update_if_published?
      super # TODO (if no reviewing and no reactions + toggle)
    end

    def creation_phase?
      true # TODO (use transitive? instead, get collections of ideas and of proposals)
    end

    def custom_form
      super # TODO (use transive? and use form of phase)
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
