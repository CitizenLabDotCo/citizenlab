# frozen_string_literal: true

require 'pathname'

# Heavily inspired by:
# https://gitlab.com/gitlab-org/gitlab-foss/-/blob/master/lib/gitlab.rb
module CitizenLab
  def self.root
    Pathname.new(File.expand_path('..', __dir__))
  end

  def self.ee?
    @is_ee ||= root.join('engines/ee/multi_tenancy').exist? && %w[true 1].include?(ENV['CITIZENLAB_EE'].to_s)
  end

  def self.ee
    yield if ee?
  end

  def self.cl_config
    if !@cl_config
      @cl_config ||= JSON.load(File.new('../citizenlab.config.json'))
      if File.exists?('../citizenlab.config.ee.json')
        cl_config_ee = JSON.load(File.new('../citizenlab.config.ee.json'))
        @cl_config['modules'] = @cl_config['modules'].merge(cl_config_ee['modules'])
      end
    end
    @cl_config
  end

  def self.enabled_modules
    cl_config['modules'].keys.select do |m|
      cl_config['modules'][m]
    end
  end

end
