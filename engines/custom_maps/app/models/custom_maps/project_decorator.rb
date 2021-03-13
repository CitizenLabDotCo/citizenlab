module CustomMaps::ProjectDecorator
  extend ActiveSupport::Concern

  included do
    has_one :map_config, class_name: 'CustomMaps::MapConfig', dependent: :destroy
  end
end
