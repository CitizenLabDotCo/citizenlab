# frozen_string_literal: true

module ContentBuilder
  module Patches
    module SideFxPhaseService
      def after_update(phase, user)
        super
        ContentBuilder::SpotlightSurveyWidgetCleanupService.new.cleanup_moved(phase)
      end

      def after_destroy(frozen_phase, user)
        super
        ContentBuilder::SpotlightSurveyWidgetCleanupService.new.cleanup_destroyed(frozen_phase)
      end
    end
  end
end
