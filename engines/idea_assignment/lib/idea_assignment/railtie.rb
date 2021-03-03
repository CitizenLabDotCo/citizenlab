module IdeaAssignment
  class Railtie < ::Rails::Engine
    def self.activate
      Dir.glob(::File.join(::File.dirname(__FILE__), './**/*.rb')).sort.each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare(&method(:activate).to_proc)
  end
end
