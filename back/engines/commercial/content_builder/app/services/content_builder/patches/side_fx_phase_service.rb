# frozen_string_literal: true

module ContentBuilder
  module Patches
    module SideFxPhaseService
      def after_update(phase, user)
        super
        return unless phase.placement_type_previously_changed? && phase.on_timeline?

        ContentBuilder::LayoutService.new.clean_project_page_when_survey_phase_removed(phase)
      end

      def after_destroy(frozen_phase, user)
        super
        ContentBuilder::LayoutService.new.clean_project_page_when_survey_phase_removed(frozen_phase)
      end
    end
  end
end
