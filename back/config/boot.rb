ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

# To benchmark boot time, uncomment following monkey patch
# from  https://mildlyinternet.com/code/profiling-rails-boot-time.html
#
# require "benchmark"
#
# def require(file_name)
#   result = nil
#   time = Benchmark.realtime do
#     result = super
#   end
#   if time > 0.1
#     puts "#{time} #{file_name}"
#   end
#   result
# end

require 'bundler/setup' # Set up gems listed in the Gemfile.
require 'bootsnap/setup' # Speed up boot time by caching expensive operations.
