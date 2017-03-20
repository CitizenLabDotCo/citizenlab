require 'rails/generators/resource_helpers'

class ApiControllerGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)

  include ::Rails::Generators::ResourceHelpers

  check_class_collision suffix: "Controller"

  class_option :orm, banner: "NAME", type: :string, required: true,
    desc: "ORM to generate the controller for"

  def create_controller_file
    template "controller.rb", File.join('app/controllers/api/v1', controller_class_path, "#{controller_file_name}_controller.rb")
  end

  def add_routes_entry
    insert_into_file "config/routes.rb", :after => "namespace :v1 do\n" do
      <<CODE
      resources :#{controller_file_name}
CODE
    end
  end

  hook_for :test_framework
end
