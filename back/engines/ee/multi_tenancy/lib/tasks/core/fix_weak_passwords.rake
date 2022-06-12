# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix weak passwords of admin accounts for all existing tenants.'
  task :fix_weak_passwords, [:weak_passwords] => [:environment] do |_t, args|
    changes = {}
    weak_passwords = open(args.weak_passwords).readlines.map(&:strip)
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        citizenlab_admins = User.admin.select do |admin|
          admin.email.ends_with? '@citizenlab.co'
        end
        citizenlab_admins.each do |admin|
          password = weak_passwords.find do |pwd|
            admin.authenticate pwd
          end
          next unless password

          puts "Weak password found for #{admin.email}, updating..."
          admin.password = SecureRandom.urlsafe_base64 32
          admin.save!
          changes[tenant.host] ||= []
          changes[tenant.host] += [admin.email]
        end
      end
    end
    pp changes
  end
end
