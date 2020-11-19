# lib/tasks/temporary/users.rake

def each_tenant
  Tenant.all.each do |tenant|
    Apartment::Tenant.switch(tenant.schema_name) do
      yield tenant if block_given?
    end
  end
end

# @param [Symbol] attribute_name
# @param [Tenant] tenant
# @param [AppConfiguration] app_configuration
def migrate_uploads(attribute_name, tenant, app_configuration, dry_run = true)
  from_bucket = tenant.send(attribute_name).fog_directory
  from_prefix = tenant.send(attribute_name).store_dir
  to_bucket = app_configuration.send(attribute_name).fog_directory
  to_prefix = app_configuration.send(attribute_name).store_dir
  move_objects(from_bucket, from_prefix, to_bucket, to_prefix, dry_run)
end

# @param [String] from_bucket
# @param [String] from_prefix
# @param [String] to_bucket
# @param [String] to_prefix
# @param [Boolean] dry_run
def move_objects(from_bucket, from_prefix, to_bucket, to_prefix, dry_run = true)
  s3 = Aws::S3::Resource.new
  objects = s3.bucket(from_bucket).objects(prefix: from_prefix)

  objects.each do |object|
    new_key = object.key.sub(from_prefix, to_prefix)
    puts "#{from_bucket}/#{from_prefix} => #{to_bucket}/#{to_prefix}"
    object.copy_to(bucket: to_bucket, key: new_key) unless dry_run
  end
end

namespace :app_configurations do
  desc "Migrate data from 'tenants' table to 'app_configurations' table"
  task :import_from_tenant => :environment do
    each_tenant do |tenant|
      AppConfiguration.instance.update!(
          logo: tenant.logo,
          header_bg: tenant.header_bg,
          favicon: tenant.favicon,
          settings: tenant.settings,
          style: tenant.style
      )
    end
  end

  # logo, favicon, header_bg will be removed from Tenant and will be mounted on
  # AppConfiguration. This has a consequence on the storage directory path (bc
  # the model class is part of the path). So we need to move (copy here) the
  # uploaded to the new expected location).
  desc "Migrate tenant images."
  task :migrate_s3_image_uploads, [:dry_run] => :environment do |_, args|
    dry_run = args.dry_run.nil? || args.dry_run.downcase != "false"
    each_tenant do |tenant|
      app_configuration = AppConfiguration.instance
      migrate_uploads(:favicon, tenant, app_configuration, dry_run)
      migrate_uploads(:logo, tenant, app_configuration, dry_run)
      migrate_uploads(:header_bg, tenant, app_configuration, dry_run)
    end
  end
end



