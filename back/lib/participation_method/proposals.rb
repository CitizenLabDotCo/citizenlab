# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def transitive?
      false
    end

    def default_fields(custom_form)
      super # TODO
    end

    def constraints
      super # TODO
    end

    def create_default_form!
      super # TODO (link to phase instead of project)
    end

    def budget_in_form?(_)
      false
    end
  end
end
