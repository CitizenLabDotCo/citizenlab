require 'citizen_lab/engine_extension'
require 'citizen_lab/enterprise_module_extension'
require 'citizen_lab/mixins/feature_specification'
require 'citizen_lab/mixins/settings_specification'

module CitizenLab
  class Railtie < ::Rails::Railtie
    Module.prepend(EnterpriseModuleExtension)
  end
end
