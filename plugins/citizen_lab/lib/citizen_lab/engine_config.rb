# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module CitizenLab
  module EngineConfig
    def self.included(base)
      base.class_eval do
        def self.module_name
          name.split('::')[0...-1].join('::').safe_constantize
        end

        def self.add_feature_spec
          return unless defined?(module_name::FeatureSpecification)

          AppConfiguration::Settings.add_feature(module_name::FeatureSpecification)
        end

        isolate_namespace module_name

        if Rails.env.development? || Rails.env.test?
          config.autoload_paths << "#{config.root}/lib"
        else
          config.eager_load_paths << "#{config.root}/lib"
        end

        factories_path = File.expand_path('../../spec/factories', __dir__)
        config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

        config.to_prepare(&method(:add_feature_spec).to_proc)

        initializer 'citizen_lab.append_migrations' do |app|
          break if app.root.to_s == root.to_s

          config.paths['db/migrate'].expanded.each do |path|
            app.config.paths['db/migrate'].push(path)
          end
        end
      end
    end
  end
end
