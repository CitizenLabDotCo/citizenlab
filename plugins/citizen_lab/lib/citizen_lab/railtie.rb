require 'citizen_lab/engine'
require 'citizen_lab/enterprise/module'
require 'citizen_lab/mixins/feature_specification'
require 'citizen_lab/mixins/settings_specification'

module CitizenLab
  class Railtie < ::Rails::Railtie
    Module.prepend(Enterprise::Module)
  end
end
