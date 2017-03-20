module Rspec
  module Generators
    class ApiControllerGenerator < Rails::Generators::NamedBase
      source_root File.expand_path("../templates", __FILE__)

      desc "Generates an API controller spec in spec/api"

      def generate_spec
        empty_directory 'spec/api'
        template "api_spec.rb", "spec/request/#{file_name.pluralize}_spec.rb"
      end
    end
  end
end
