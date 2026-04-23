# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module InputsGenerator
      private

      def eager_load_inputs(inputs)
        super.includes(:idea_import)
      end
    end
  end
end
