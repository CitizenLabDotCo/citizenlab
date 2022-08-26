# frozen_string_literal: true

module ParticipationMethod
  class Base
    def initialize(participation_context)
      @participation_context = participation_context
    end

    def validate_input(input); end

    def assign_slug(input)
      # Default is to do nothing, because for some
      # participation methods the slug is generated.
    end

    def assign_idea_status(input)
      # Default is to do nothing, because for some
      # participation methods the idea status is assigned.
    end

    def validate_built_in_fields?
      # Most participation methods do not have built-in fields,
      # so return false.
      false
    end

    private

    attr_reader :participation_context
  end
end
