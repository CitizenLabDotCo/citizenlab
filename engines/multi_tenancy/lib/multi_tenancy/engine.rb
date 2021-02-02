module MultiTenancy
  class Engine < ::Rails::Engine
    config.generators.api_only = true

    def self.apply_patches
      Dir.glob(::File.join(::File.dirname(__FILE__), '../../app/**/*_decorator*.rb')).sort.each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare(&method(:apply_patches).to_proc)
  end
end
