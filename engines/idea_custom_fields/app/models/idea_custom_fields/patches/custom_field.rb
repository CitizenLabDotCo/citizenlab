module IdeaCustomFields
  module Patches
    module CustomField
      def fieldable_types
        super + ['IdeaCustomFields::CustomForm']
      end
    end
  end
end
