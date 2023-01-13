# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class UserCustomFieldSerializer < ::WebApi::V1::CustomFieldSerializer
        # Warning: This creates an N+1 query problem.
        # If the performance becomes an issue, +current_ref_distribution+ method should
        # be rewritten as an association in the +CustomField+ *model*, either through a
        # +belongs_to+ or an +has_one+.
        # * +belongs_to+ would probably be the best option, but it's more work to
        #   implement. (It would certainly require a join table and we would have to
        #   implement the lifecycle logic to keep that table up to date.)
        # * +has_one+ is possible also and cheaper to implement, but it may result in
        #   unexpected behavior when combined into more complex queries.
        #   See: https://stackoverflow.com/questions/15824041/rails-associations-has-one-latest-record.
        has_one(
          :current_ref_distribution,
          record_type: :reference_distribution,
          polymorphic: true
        ) do |record, _params|
          record.current_ref_distribution
        end
      end
    end
  end
end
