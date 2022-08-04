# frozen_string_literal: true

module ParticipationMethod
  class Base
    def initialize(project)
      @project = project
    end

    def assign_slug!(input)
      # Default is to do nothing, because for some
      # participation methods the slug is generated.
    end

    def validate_built_in_fields?
      # Most participation methods do not have built-in fields,
      # so return false.
      false
    end

    private

    attr_reader :project
  end
end
