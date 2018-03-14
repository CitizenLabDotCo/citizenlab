
namespace :periodic_events do
  desc "Sends out the periodic events used for sending out e.g. weekly user digest emails."
  task :prt => [:environment] do |t, args|
    puts 'Prrt!'
  end
end
