module CustomStyle
  class Engine < ::Rails::Engine
    isolate_namespace CustomStyle
    config.generators.api_only = true

    def self.apply_patches
      patches_paths =  Dir.glob(File.join(::File.dirname(__FILE__), '../../app/**/extensions/**/*.rb'))
      patches_paths += Dir.glob(File.join(::File.dirname(__FILE__), '../../app/**/patches/**/*.rb'))

      patches_paths.sort.each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare(&method(:apply_patches))
  end
end
