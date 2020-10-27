require 'rails/generators'

class Generators::Service::ServiceGenerator < Rails::Generators::NamedBase
  class << self
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

  template 'service.erb'
  folder 'app/services'
  service_name 'service'

  source_root File.expand_path('templates', __dir__)

  argument :methods, type: :array, default: [], banner: 'method method'
  class_option :module, type: :string

  def create_service_file
    @module_name = options[:module]

    service_dir_path = service_folder_name
    generator_dir_path = service_dir_path + ("/#{@module_name.underscore}" if @module_name.present?).to_s
    generator_path = generator_dir_path + "/#{file_name}_#{service_name}.rb"

    Dir.mkdir(service_dir_path) unless File.exist?(service_dir_path)
    Dir.mkdir(generator_dir_path) unless File.exist?(generator_dir_path)

    template template_file, generator_path
  end

  def create_spec_file
    @module_name = options[:module]

    spec_dir_path = service_folder_name.gsub('app', 'spec')
    generator_dir_path = spec_dir_path + ("/#{@module_name.underscore}" if @module_name.present?).to_s
    generator_path = generator_dir_path + "/#{file_name}_#{service_name}_spec.rb"

    Dir.mkdir(spec_dir_path) unless File.exist?(spec_dir_path)
    Dir.mkdir(generator_dir_path) unless File.exist?(generator_dir_path)

    template "#{service_name}_spec.erb", generator_path
  end
end
