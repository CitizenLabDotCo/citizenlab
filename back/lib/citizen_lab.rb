# frozen_string_literal: true

require 'pathname'

module CitizenLab
  def self.root
    Pathname.new(File.expand_path('..', __dir__))
  end
end
