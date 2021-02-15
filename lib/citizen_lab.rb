# frozen_string_literal: true

require 'pathname'

module CitizenLab
  def self.root
    Pathname.new(File.expand_path('..', __dir__))
  end

  def self.ee?
    @is_ee ||= root.join('engines/multi_tenancy').exist? && %w[true 1].include?(ENV['CITIZENLAB_EE'].to_s)
  end

  def self.ee
    yield if ee?
  end
end
