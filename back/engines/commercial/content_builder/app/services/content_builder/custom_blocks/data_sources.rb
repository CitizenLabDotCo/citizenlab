# frozen_string_literal: true

module ContentBuilder
  module CustomBlocks
    # Which reporting tables a block's queries read, for the report author checking
    # where a chart's numbers come from.
    #
    # Read from the stored SQL rather than recorded at build time, so it also answers
    # for blocks authored before this existed.
    class DataSources
      # @param queries [Array<String>] a version's manifest queries.
      # @return [Array<String>] reporting table names, in the order the queries name
      #   them. A query the sandbox can no longer parse contributes nothing.
      def self.for_queries(queries)
        Array(queries)
          .flat_map { |sql| ::McpServer::SqlSandboxer.validate(sql).relations }
          .uniq
      end
    end
  end
end
