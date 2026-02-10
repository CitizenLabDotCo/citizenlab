namespace :fix_existing_tenants do
  desc 'Move/copy RestrictedFile objects from files/restricted_file to files/file. DRY_RUN=true (default), DELETE_OLD=false'
  task :move_restricted_files, %i[dry_run] => [:environment] do |_, args|
    dry_run = args[:dry_run].to_s.downcase != 'false'

    reporter = ScriptReporter.new

    s3 = Aws::S3::Client.new(region: ENV.fetch('AWS_REGION'))
    s3_utils = Aws::S3::Utils.new
    bucket = ENV.fetch('AWS_S3_BUCKET')

    Tenant.creation_finalized.each do |tenant|
      tenant.switch do
        s3_prefix = "uploads/#{tenant.id}/files/restricted_file/"
        restricted_files = s3_utils.objects(s3, bucket: bucket, prefix: s3_prefix)
        next if restricted_files.none?

        mapping = if dry_run
          restricted_files.map.to_h do |restricted_file|
            [restricted_file.key, restricted_file.key.sub('/files/restricted_file/', '/files/file/')]
          end
        else
          s3_utils.copy_objects(
            bucket,
            s3,
            bucket,
            dest_s3_client: s3,
            prefix: s3_prefix,
            copy_args: { acl: 'public-read' }
          ) do |key|
            key.sub('/files/restricted_file/', '/files/file/')
          end
        end

        mapping.each do |old_key, new_key|
          reporter.add_change(old_key, new_key, context: { tenant: tenant.host })
        end
        reporter.add_processed_tenant(tenant)
      end
    end
    reporter.report!('move_restricted_files_report.json', verbose: true)
  end
end
