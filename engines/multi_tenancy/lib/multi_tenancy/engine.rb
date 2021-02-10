module MultiTenancy
  class Engine < ::Rails::Engine
    config.generators.api_only = true

    def self.reload_extensions
      module_paths =  Dir.glob(File.join(::File.dirname(__FILE__), '../../app/**/extensions/**/*.rb'))
      module_paths += Dir.glob(File.join(::File.dirname(__FILE__), '../../app/**/patches/**/*.rb'))
      module_paths.sort.each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare(&method(:reload_extensions))
  end
end
