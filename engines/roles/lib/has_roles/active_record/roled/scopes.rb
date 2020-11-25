# frozen_string_literal: true

module HasRoles
  module ActiveRecord
    module Roled
      module Scopes
        NORMAL_USER_QUERY_SQL = "roles = '[]'::jsonb"

        def self.included(base)
          base.class_eval do
            scope :order_role, lambda { |direction = :asc|
              joins('LEFT OUTER JOIN (SELECT jsonb_array_elements(roles) as ro, id FROM users) as r ON users.id = r.id')
                .order(Arel.sql("(roles @> '[{\"type\":\"admin\"}]')::integer #{direction}"))
                .reverse_order
                .group('users.id')
            }

            scope :normal_user,       -> { where(NORMAL_USER_QUERY_SQL) }
            scope :not_normal_user,   -> { where.not(NORMAL_USER_QUERY_SQL) }
          end
        end
      end
    end
  end
end
