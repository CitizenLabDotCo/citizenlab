# frozen_string_literal: true

module Ideas
  class CopyService
    def copy(filters, dest_phase, current_user, initial_scope = Idea)
      ideas = IdeasFinder.new(
        filters,
        scope: initial_scope.submitted_or_published,
        current_user: current_user
      ).find_records

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
