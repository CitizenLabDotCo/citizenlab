# frozen_string_literal: true

module Ideas
  class CopyService
    # @param [Symbol] idea_scope
    # @param [Hash] idea_filters
    def self.async_copy(idea_scope, idea_filters, dest_phase, current_user)
      CopyJob.perform_later_with_tracking(
        idea_scope,
        idea_filters,
        dest_phase,
        current_user
      )
    end

    def copy(ideas, dest_phase, _current_user)
      new_ids = ideas.map do |idea|
        idea.dup.tap do |i|
          i.project = dest_phase.project
          i.phases = [dest_phase]
          i.slug = nil
        end.save!
      end

      Idea.where(id: new_ids)
    end
  end
end
