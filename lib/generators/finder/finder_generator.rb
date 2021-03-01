require 'generators/service/service_generator'

class Generators::Finder::FinderGenerator < Generators::Service::ServiceGenerator
  template 'finder.erb'
  folder 'app/finders'
  service_name 'finder'
  source_root File.expand_path('templates', __dir__)
  argument :methods, type: :array, default: [], banner: 'method method'
  class_option :module, type: :string
end
