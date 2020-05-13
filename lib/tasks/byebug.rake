namespace :debugging do
  desc "Debugging issues in production rake tast environment"
  task :byebug => :environment do
    byebug
  end
end