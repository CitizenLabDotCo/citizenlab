


namespace :ss do
  desc "Shifts all timestamps of the specified tenant by specified number of days"
  task :shift_timestamps, [:host, :n_days] => [:environment] do |t, args|
    host = args[:host]
    n_days = args[:n_days].to_i
    Apartment::Tenant.switch(host.gsub('.', '_')) do
      Rails.application.eager_load!
      ActiveRecord::Base.descendants.each do |model|
        puts model.name
        begin
          model.all.each do |instance|
            instance.attributes.each do |name, value|
              if name.ends_with?('_at') && value
                instance.update_columns({ name.to_sym => (value + n_days.days) })
              end
            end
          end
        rescue Exception => e
          puts e.message
        end
      end
    end
  end

end