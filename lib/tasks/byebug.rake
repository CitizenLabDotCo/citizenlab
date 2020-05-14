require 'byebug'

namespace :debugging do
  desc "Debugging issues in production rake task environment"
  task :byebug => :environment do
    byebug
  end
end