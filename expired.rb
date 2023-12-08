Tenant.all.each do |tenant|
  Apartment::Tenant.switch(tenant.schema_name) do
    settings = AppConfiguration.instance.settings
    puts "#{tenant.id},#{tenant.host},#{tenant.created_at}" if settings['core']['lifecycle_stage'] == 'expired_trial'
  end
end

# 991a4d4d-7287-48c7-ae12-7351c646e62a,itinera.demo.citizenlab.co,2023-03-30 15:25:34 UTC
# # Rails console: YES, EU, Metabase: NO, AdminHQ: NO, Online: YES
# f5b02efc-66d0-4f63-af0c-6dd1da49db22,bwbrabant.citizenlab.co,2023-10-02 18:48:26 UTC
# # Rails console: YES, EU, Metabase: YES, AdminHQ: NO, Online: YES
# b160f5c3-0e27-4de3-8155-9532ea90a19b,jeparticipe-stpdp.demo.citizenlab.co,2023-10-13 13:15:44 UTC
# # On AdminHQ, no issues
# d88707b5-6324-4d17-a7ef-43730dafa9fc,lesabymes.demo.citizenlab.co,2023-05-30 07:07:56 UTC
# # Rails console: YES, EU, Metabase: NO, AdminHQ: NO, Online: YES
# 92ee1369-3765-41c1-a386-1c0dcd27782a,lahti.demo.citizenlab.co,2023-06-13 14:06:00 UTC
# # Rails console: YES, EU, Metabase: NO, AdminHQ: NO, Online: YES (but projects broken)
# 1db9dc47-26bb-4ea0-9e53-227491a319a3,vd.demo.citizenlab.co,2023-06-13 14:30:38 UTC
# # Rails console: YES, EU, Metabase: NO, AdminHQ: NO, Online: YES
# 4b99f294-29a2-4def-af01-e60092163b0c,berchem-sainte-agathe.demo.citizenlab.co,2023-03-23 16:20:15 UTC
# # Rails console: YES, EU, Metabase: NO, AdminHQ: NO, Online: YES


Tenant.all.each do |tenant|
  Apartment::Tenant.switch(tenant.schema_name) do
    puts "#{tenant.id},#{tenant.host},#{tenant.created_at}" if tenant.host.include? '2030beyond'
  end
end