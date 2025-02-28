# frozen_string_literal: true

module FlagInappropriateContent
  module Patches
    module SideFxCommentService
      def after_create(comment, user)
        super
        ToxicityDetectionJob.perform_later comment
      end

      def after_update(comment, user)
        if comment.saved_change_to_body_multiloc?
          ToxicityDetectionJob.perform_later comment # before super to reliably detect attribute changes
        end
        super
      end
    end
  end
end
