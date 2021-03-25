module CustomTopics
  module Patches
    module Topic

      CUSTOM_CODE = 'custom'

      def self.prepended(base)
        base.before_validation :set_code

        base.singleton_class.prepend ClassMethods 
      end

      module ClassMethods
        def codes
          super + [CUSTOM_CODE]
        end
      end


      def custom?
        self.code == CUSTOM_CODE
      end


      private

      def set_code
        self.code ||= CUSTOM_CODE
      end
    end
  end
end