# frozen_string_literal: true

require 'byebug'

namespace :debugging do
  desc 'Debugging issues in production rake task environment'
  task byebug: :environment do
    byebug # rubocop:disable Lint/Debugger
  end
end
