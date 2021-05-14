module FlagInappropriateContent
  module Patches
    module SideFxCommentService

      def after_create initiative, user
        super
        ToxicityDetectionJob.perform_later initiative, attributes: [:body_multiloc]
      end

      def after_update initiative, user
        if initiative.saved_change_to_body_multiloc?
          ToxicityDetectionJob.perform_later initiative, attributes: [:body_multiloc] # before super to reliably detect attribute changes
        end
        super
      end
    end
  end
end
