# frozen_string_literal: true

require 'pathname'

# Heavily inspired by:
# https://gitlab.com/gitlab-org/gitlab-foss/-/blob/master/lib/gitlab.rb
module CitizenLab
  def self.root
    Pathname.new(File.expand_path('..', __dir__))
  end
end
