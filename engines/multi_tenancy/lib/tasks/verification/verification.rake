
namespace :verification do
  desc "Modifies tenants using FranceConnect (Orsay) to use the new verification system"
  task :migrate_franceconnect => :environment do |t, args|
    time = Time.now
    verification_service = Verification::VerificationService.new
    Tenant.all.each do |tenant|
      if tenant.has_feature?('franceconnect_login')
        Apartment::Tenant.switch(tenant.schema_name) do
          Identity.where(provider: 'franceconnect').each do |identity|
            verification = ::Verification::Verification.new(
              method_name: 'franceconnect',
              hashed_uid: verification_service.send(:hashed_uid, identity.uid, 'franceconnect'),
              user: identity.user,
              active: true,
              created_at: identity.created_at,
              updated_at: identity.updated_at
            )

            unless ::Verification::Verification.where(
              method_name: verification.method_name,
              hashed_uid: verification.hashed_uid,
              active: verification.active,
              user: verification.user,
              created_at: verification.created_at
            ).exists?
              ActiveRecord::Base.transaction do
                verification.save!
                identity.user.update!(verified: true)
              end
            end

          end
        end
      end
    end
  end

end