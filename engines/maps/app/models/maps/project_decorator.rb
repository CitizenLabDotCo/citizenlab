module Maps::ProjectDecorator
  extend ActiveSupport::Concern

  included do
    has_one :map_config, class_name: 'Maps::MapConfig', dependent: :destroy
  end
end
