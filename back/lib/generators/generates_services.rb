module Generators
  module GeneratesServices
    def self.included(base)
      base.extend(ClassMethods)
    end

    module ClassMethods
      def folder(folder_name)
        define_method(:service_folder_name) { folder_name }
      end

      def template(template_file)
        define_method(:template_file) { template_file }
      end

      def service_name(name)
        define_method(:service_name) { name }
      end
    end
  end
end
