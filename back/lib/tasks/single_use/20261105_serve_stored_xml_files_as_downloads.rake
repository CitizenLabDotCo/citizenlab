# frozen_string_literal: true

# BaseFileUploader only sets the disposition when a file is uploaded, so files stored before
# XML became download only are still served inline. This rewrites their S3 metadata.
namespace :single_use do
  # The store dirs of the models that mount a BaseFileUploader. FileUpload is stored under
  # idea_file (see IdeaFileUploader#store_dir).
  file_dirs = %w[
    files/file/content
    files/preview/content
    idea_file/file
    project_file/file
    event_file/file
    phase_file/file
    static_page_file/file
    project_folders/file/file
    export/result_file/content
    bulk_import_ideas/idea_import_file/file
  ]

  desc "Serve stored XML files as downloads. Dry run unless passed 'execute'."
  task :serve_stored_xml_files_as_downloads, %i[execute host] => [:environment] do |_t, args|
    s3 = Aws::S3::Client.new(region: ENV.fetch('AWS_REGION'))
    bucket = ENV.fetch('AWS_S3_BUCKET')
    s3_utils = Aws::S3::Utils.new
    # Read before the threads start, so they don't all autoload the uploader at once.
    download_only = BaseFileUploader.method(:download_only?)

    TenantScript.run(
      'serve_stored_xml_files_as_downloads',
      args: args,
      description: 'serving stored XML files as downloads'
    ) do |tenant, script|
      file_dirs.each do |dir|
        objects = s3_utils.objects(s3, bucket: bucket, prefix: "uploads/#{tenant.id}/#{dir}/")
        # Each file needs its own S3 calls, so they run in threads. The reporter is not thread
        # safe: the threads only return results, which are reported afterwards.
        results = Parallel.map(objects, in_threads: 4) do |object|
          head = s3.head_object(bucket: bucket, key: object.key)
          next unless download_only.call(head.content_type)

          disposition = head.content_disposition.to_s
          new_disposition = disposition.blank? ? 'attachment' : disposition.sub(/\Ainline/i, 'attachment')
          next if new_disposition == disposition

          if script.execute?
            # A copy resets the ACL to private, so public-read is set again. Tags are copied.
            s3.copy_object(
              bucket: bucket,
              key: object.key,
              copy_source: CGI.escape("#{bucket}/#{object.key}"),
              metadata_directive: 'REPLACE',
              metadata: head.metadata,
              content_type: head.content_type,
              cache_control: head.cache_control,
              content_disposition: new_disposition,
              acl: 'public-read'
            )
          end
          { key: object.key, content_type: head.content_type, old: disposition, new: new_disposition }
        rescue Aws::Errors::ServiceError, Seahorse::Client::NetworkingError => e
          # One file that can't be read or copied must not stop the other files of the tenant,
          # nor drop the files already copied from the report. Other errors are bugs: they stop
          # the tenant, which TenantScript reports, and the run goes on with the next tenant.
          { key: object.key, error: e }
        end

        results.compact.each do |result|
          context = { tenant: tenant.host, key: result[:key] }
          if result[:error]
            # S3 errors on HEAD requests have an empty message, so the class names the error.
            script.reporter.add_error("#{result[:error].class.name}: #{result[:error].message}", context: context)
          else
            script.reporter.add_change(
              result[:old],
              result[:new],
              context: context.merge(content_type: result[:content_type])
            )
          end
        end
      end
    end
  end
end
