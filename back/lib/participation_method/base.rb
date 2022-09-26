# frozen_string_literal: true

module ParticipationMethod
  class Base
    def initialize(participation_context)
      @participation_context = participation_context
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

    def assign_default_idea_status(input)
      input.idea_status ||= IdeaStatus.find_by!(code: 'proposed')
    end

    def assign_defaults(input)
      # Default is to do nothing.
    end

    private

    attr_reader :participation_context
  end
end
