# frozen_string_literal: true

module FlagInappropriateContent
  module Extensions
    module IdeasFinder
      private

      def content_warnings_condition(value)
        return unless value.in?([true, 'true', '1', 1])
        return records.none unless current_user&.active?

        flagged_ids = InappropriateContentFlag.where(flaggable_type: 'Idea', deleted_at: nil).select(:flaggable_id)
        moderatable_records.where(id: flagged_ids)
      end
    end
  end
end
