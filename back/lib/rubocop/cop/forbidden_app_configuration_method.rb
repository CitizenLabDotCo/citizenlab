# frozen_string_literal: true

require 'rubocop'

module Rubocop
  module Cop
    class ForbiddenAppConfigurationMethod < RuboCop::Cop::Base
      # {nil? | (cbase) } allows to match both `AppConfiguration...` (nil?) and
      # `::AppConfiguration...` (cbase).
      def_node_matcher :app_configuration_method?, <<~PATTERN
        (send (const { nil? | (cbase) } :AppConfiguration) $_)
      PATTERN

      FORBIDDEN_METHODS = %i[
        find find_by find_by! take take! sole find_sole_by first first! last last!
        second second! third third! fourth fourth! fifth fifth!
        forty_two forty_two! third_to_last third_to_last! second_to_last second_to_last!
        first_or_create first_or_create! first_or_initialize
        find_or_create_by find_or_create_by! find_or_initialize_by
        create_or_find_by create_or_find_by!
        find_each find_in_batches in_batches
        select reselect order in_order_of reorder limit offset
        where rewhere invert_where
      ].to_set.freeze

      MSG = '`AppConfiguration.instance` should be used to access the app configuration.'

      def on_send(node)
        app_configuration_method?(node) do |method_name|
          return unless FORBIDDEN_METHODS.include?(method_name)

          add_offense(node)
        end
      end
    end
  end
end
