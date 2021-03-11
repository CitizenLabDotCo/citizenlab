module IdeaCustomFields
  module Patches
    module CustomField
      def fieldable_types
        super + ['CustomForm']
      end
    end
  end
end
