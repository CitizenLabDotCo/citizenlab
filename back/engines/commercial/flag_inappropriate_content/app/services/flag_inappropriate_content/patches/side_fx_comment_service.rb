module FlagInappropriateContent
  module Patches
    module SideFxCommentService

      def after_create comment, user
        super
        ToxicityDetectionJob.perform_later comment, attributes: [:body_multiloc]
      end

      def after_update comment, user
        if comment.saved_change_to_body_multiloc?
          ToxicityDetectionJob.perform_later comment, attributes: [:body_multiloc] # before super to reliably detect attribute changes
        end
        super
      end
    end
  end
end
