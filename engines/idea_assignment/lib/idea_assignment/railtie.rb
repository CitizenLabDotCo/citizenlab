module IdeaAssignment
  class Railtie < ::Rails::Railtie
    def self.activate
      Dir.glob(::File.join(::File.dirname(__FILE__), './**/*.rb')).sort.each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare(&method(:activate).to_proc)

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdeaAssignment::FeatureSpecification)
    end
  end
end
