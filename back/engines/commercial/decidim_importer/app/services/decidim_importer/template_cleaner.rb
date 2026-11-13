# frozen_string_literal: true

require 'net/http'

module DecidimImporter
  # Cleans a loaded template hash before deserialize: prunes uploads the import can't fetch or store —
  # unreachable images, and files whose extension the upload allowlist rejects or that are over the upload
  # size limit — (or strips them all when fetching is off) and removes the file/craftjs nodes left dangling
  # as a result.
  #
  # rubocop:disable Metrics/ModuleLength -- the image/craftjs pruning passes are one cohesive concern.
  module TemplateCleaner
    # The `remote_*_url` attribute carrying a `Files::File`'s content — the one upload in a template that
    # goes through {Files::FileUploader} and so must satisfy {SafeUploadAllowlist::EXTENSIONS}.
    FILE_CONTENT_URL_KEY = 'remote_content_url'

    module_function

    # Prepares the template's uploads (both `remote_*_url` attachments and embedded `<img>` tags). With
    # fetching off, drop them all so no HTTP happens. With fetching on, probe each once (shared cache) and
    # drop the ones that would abort the import: a since-deleted image that would 404, and a file whose
    # extension isn't on the upload allowlist or whose size is over the upload limit. Returns the dropped
    # uploads (see {.dropped_upload}) for the run report; none when fetching is off, as that drop is asked for.
    def prepare_uploads!(template, import_uploads:)
      dropped = []
      if import_uploads
        importable = {}
        prune_unreachable_remote_urls!(template, importable, dropped)
        prune_unreachable_embedded_images!(template, importable, dropped)
      else
        strip_remote_upload_urls!(template)
        strip_embedded_images!(template)
      end
      dropped
    end

    # Drops the content of every `Files::File` over the upload size limit, then the file and what points
    # at it ({.prune_fileless_attachments!}). Run while the template is built: an importer without the size
    # check (e.g. an older deployed version) aborts the whole template on such a file, so it must not reach
    # the template. Adds each drop to `dropped` (see {.dropped_upload}) and returns it. A file whose size
    # can't be read is kept; the import checks it again.
    def prune_oversized_files!(template, dropped = [])
      max_size = Files::FileUploader.new.size_range.max
      template.dig('models', 'files/file')&.each do |attrs|
        url = attrs[FILE_CONTENT_URL_KEY]
        next unless url.is_a?(String)

        _reachable, _bytes, size = probe_image(url)
        next unless size && size > max_size

        reason = too_large_reason(max_size)
        label = attrs['name'].presence || FILE_CONTENT_URL_KEY
        Rails.logger.warn "Decidim import: dropping #{label} because #{reason} (#{url})"
        dropped << dropped_upload(template, attrs, label, url, reason)
        attrs.delete(FILE_CONTENT_URL_KEY)
      end
      prune_fileless_attachments!(template)
      dropped
    end

    def too_large_reason(max_size)
      "it is larger than the #{max_size / 1.megabyte} MB upload limit"
    end

    # Drops any `Files::File` left without content (pruned/stripped) — plus its dependent `files_project`
    # join, `file_attachment`, and any layout node pointing at it — since a content-less file is a broken
    # attachment the deserializer would choke on.
    def prune_fileless_attachments!(template)
      files = template.dig('models', 'files/file')
      return unless files

      removed = files.reject { |attrs| attrs['remote_content_url'].present? || attrs['content'].present? }
      return if removed.empty?

      # Dependents share the removed file's exact attribute-hash object (YAML anchor/alias), so match by
      # object identity — no dangling `file_ref` may survive to crash the deserializer.
      removed_ids = removed.to_set(&:object_id)
      files.reject! { |attrs| removed_ids.include?(attrs.object_id) }
      template['models'].each_value do |records|
        records.reject! { |attrs| removed_ids.include?(attrs['file_ref'].object_id) }
      end
      strip_layout_file_nodes!(template, removed.filter_map { |attrs| attrs['id'] }.to_set)
    end

    # Removes `FileAttachment` craft nodes for pruned files from every layout (else `sync_file_attachments`
    # tries to attach a missing file and fails), then drops any accordion left with no files.
    def strip_layout_file_nodes!(template, removed_file_ids)
      return if removed_file_ids.empty?

      (template.dig('models', 'content_builder/layout') || []).each do |layout|
        craftjs = layout['craftjs_json']
        next unless craftjs.is_a?(Hash)

        dangling = craftjs.select do |_id, node|
          craftjs_resolved_name(node) == 'FileAttachment' && removed_file_ids.include?(node.dig('props', 'fileId'))
        end.keys
        remove_craftjs_nodes!(craftjs, dangling)
        remove_empty_accordions!(craftjs)
      end
    end

    # Deletes the given craft nodes and unlinks their ids from every node's `nodes` child list.
    def remove_craftjs_nodes!(craftjs, ids)
      return if ids.empty?

      ids.each { |id| craftjs.delete(id) }
      craftjs.each_value do |node|
        node['nodes'] -= ids if node.is_a?(Hash) && node['nodes'].is_a?(Array)
      end
    end

    # Drops `AccordionMultiloc` nodes whose linked canvas has no children left, removing accordion and
    # canvas together (the canvas would otherwise be orphaned).
    def remove_empty_accordions!(craftjs)
      empty = craftjs.select do |_id, node|
        next false unless craftjs_resolved_name(node) == 'AccordionMultiloc'

        canvas = craftjs[node['linkedNodes']&.values&.first]
        canvas.nil? || (canvas['nodes'].is_a?(Array) && canvas['nodes'].empty?)
      end
      canvases = empty.values.filter_map { |node| node['linkedNodes']&.values }.flatten
      remove_craftjs_nodes!(craftjs, empty.keys + canvases)
    end

    # Drops any project or idea image left without an image (pruned/stripped) — it would render as a broken
    # card, since the deserializer skips their image presence validation.
    def prune_imageless_images!(template)
      %w[project_image idea_image].each do |model|
        template.dig('models', model)&.reject! { |attrs| attrs['remote_image_url'].blank? && attrs['image'].blank? }
      end
    end

    # Drops every `remote_*_url` attribute so the deserializer doesn't trigger a CarrierWave fetch.
    def strip_remote_upload_urls!(template)
      template['models'].each_value do |records|
        records.each { |attrs| attrs.delete_if { |key, _| remote_upload_url?(key) } }
      end
    end

    # Removes every embedded `<img>` tag from rich-text `*_multiloc` values (text kept, images dropped).
    def strip_embedded_images!(template)
      rewrite_multiloc_html!(template) { |html| html.gsub(/<img\b[^>]*>/i, '') }
    end

    # Drops each `remote_*_url` attachment the import can't safely fetch or store (see {.prune_reason}),
    # keeping the good ones for CarrierWave. Every drop is logged and added to `dropped`, since a silently
    # missing attachment is otherwise indistinguishable from one Decidim never had.
    def prune_unreachable_remote_urls!(template, importable = {}, dropped = [])
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.reject! do |key, value|
            next false unless remote_upload_url?(key) && value.is_a?(String)

            reason = prune_reason(key, value, importable)
            if reason
              label = attrs['name'].presence || key
              Rails.logger.warn "Decidim import: dropping #{label} because #{reason} (#{value})"
              dropped << dropped_upload(template, attrs, label, value, reason)
            end
            reason.present?
          end
        end
      end
    end

    # Why this remote upload can't be imported, or nil when it's fine.
    #
    # A `Files::File`'s content is checked against the upload allowlist *first* — CarrierWave rejects a
    # disallowed extension on save, and the deserializer re-raises that validation error, aborting the
    # entire template application over one unsupported attachment (e.g. a Decidim `.emf`). Checking the
    # extension before the network probe also saves a pointless request. A file over the uploader's size
    # limit fails the same way, so the probe checks its size too. Everything else just has to be
    # fetchable, and to match its own extension if it's a recognised raster image.
    def prune_reason(key, url, importable)
      if key == FILE_CONTENT_URL_KEY && !allowed_file_extension?(url)
        ext = url_extension(url)
        return "#{ext.present? ? ".#{ext}" : 'a missing extension'} is not on the upload allowlist"
      end

      limits = key == FILE_CONTENT_URL_KEY ? { max_size: Files::FileUploader.new.size_range.max } : {}
      importable[url] = image_prune_reason(url, **limits) unless importable.key?(url)
      importable[url]
    end

    # Whether a `Files::File` content URL's extension passes the same allowlist CarrierWave enforces on
    # save ({Files::FileUploader#extension_allowlist}).
    def allowed_file_extension?(url)
      SafeUploadAllowlist::EXTENSIONS.include?(url_extension(url))
    end

    # The lowercased, dot-less extension of a URL's path ('' when it has none or the URL won't parse).
    def url_extension(url)
      File.extname(URI.parse(url).path.to_s).delete('.').downcase
    rescue URI::InvalidURIError
      ''
    end

    # A dropped upload for the run report: `{ name:, reason:, url:, page: }`. The name is the record's
    # (files have one) or the attribute; `page` says where it was shown (see {.upload_page}).
    def dropped_upload(template, attrs, name, url, reason)
      { name: name, reason: reason, url: url, page: upload_page(template, attrs, url) }
    end

    # Where a dropped upload was shown, so it can be found and fixed on Decidim: the Decidim page of its
    # project (its slug is the Decidim one), with the project's and, for an idea's image, the idea's title.
    # Nil when the record leads to no project.
    def upload_page(template, attrs, url)
      project = owning_project(template, attrs)
      return nil unless project

      space = assembly?(template, project) ? 'assemblies' : 'processes'
      # Decidim serves its uploads from its own host; other hosts (e.g. an image embedded from elsewhere)
      # say nothing about it, so the page path is then left without one.
      origin = url[%r{\Ahttps?://[^/]+(?=/rails/active_storage/)}]
      page = "#{origin}/#{space}/#{project['slug']} (project \"#{first_value(project['title_multiloc'])}\""
      idea = attrs['idea_ref']
      page += ", idea \"#{first_value(idea['title_multiloc'])}\"" if idea
      "#{page})"
    end

    # The project record an upload-holding record belongs to: the project itself, a record pointing at it
    # (an idea's image through the idea, a layout through its buildable), or a file through its
    # `files_project` join. Matched by object identity, as refs share the target's attribute hash.
    def owning_project(template, attrs)
      return attrs if template.dig('models', 'project')&.any? { |project| project.equal?(attrs) }

      ref = attrs['project_ref'] || attrs.dig('idea_ref', 'project_ref') || attrs['content_buildable_ref']
      return ref if ref&.key?('slug')

      template.dig('models', 'files/files_project')&.find { |join| join['file_ref'].equal?(attrs) }&.dig('project_ref')
    end

    # Assemblies are imported as projects under the one folder titled {ExportReader::ASSEMBLIES_FOLDER_TITLE}.
    def assembly?(template, project)
      parent = project.dig('admin_publication_attributes', 'parent_attributes_ref')
      return false unless parent

      folder = template.dig('models', 'project_folders/folder')&.find do |candidate|
        candidate['admin_publication_attributes'].equal?(parent)
      end
      folder.present? && folder['title_multiloc'].to_h.value?(ExportReader::ASSEMBLIES_FOLDER_TITLE)
    end

    def first_value(multiloc)
      multiloc.to_h.values.compact_blank.first
    end

    def remote_upload_url?(key)
      key.is_a?(String) && key.start_with?('remote_') && key.end_with?('_url')
    end

    # Drops embedded `<img>` tags the import can't fetch, keeping the rest (and the text). `data:` images
    # are kept; a src that isn't `http(s)` (e.g. a root-relative `/rails/...` path) is dropped, since the
    # rich-text handler can't download it. Each distinct URL is probed once (cache shared with attachments)
    # and every drop is logged and added to `dropped` with its reason, distinguishing not-found from a
    # format conflict.
    def prune_unreachable_embedded_images!(template, importable = {}, dropped = [])
      rewrite_multiloc_html!(template) do |html, attrs|
        html.gsub(/<img\b[^>]*>/i) do |tag|
          src = tag[/\bsrc\s*=\s*["']?([^"' >]+)/i, 1]
          next tag if src.nil? || src.start_with?('data:')

          if src.match?(%r{\Ahttps?://}i)
            importable[src] = image_prune_reason(src) unless importable.key?(src)
            reason = importable[src]
          else
            reason = 'its source is not an http(s) URL'
          end
          next tag unless reason

          Rails.logger.warn "Decidim import: dropping embedded image because #{reason} (#{src})"
          dropped << dropped_upload(template, attrs, 'embedded image', src, reason)
          ''
        end
      end
    end

    # Why the import can't safely fetch a remote image, or nil when it can. Two distinct failures, kept
    # apart so the log says which it was: the image can't be found (unreachable — 404, connection error or
    # timeout), or it's reachable but its content type disagrees with its filename extension. Decidim
    # sometimes serves e.g. a JPEG named `.png`, which Go Vocal's exiftool then rejects, aborting the whole
    # import; such images are dropped too. With `max_size`, a body larger than that (in bytes) is dropped
    # as well; an unknown size is let through.
    def image_prune_reason(url, max_size: nil)
      reachable, bytes, size = probe_image(url)
      return 'it could not be found' unless reachable
      return too_large_reason(max_size) if max_size && size && size > max_size
      return 'its content conflicts with its extension' if image_format_conflict?(url, bytes)

      nil
    end

    # A single ranged GET (following redirects): `[reachable?, leading_bytes_of_body, total_size]`. Ranged
    # GET not HEAD, because Active Storage's presigned S3 redirects are signed GET-only and 403 a HEAD
    # probe; the first bytes are enough to sniff the format (see {.detect_image_format}). The total size
    # is nil when the server sends neither a `Content-Range` total nor a full-body `Content-Length`.
    def probe_image(url, redirects_left = 5)
      uri = URI.parse(url)
      return [false, ''] unless uri.is_a?(URI::HTTP)

      response = nil
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https',
        open_timeout: 5, read_timeout: 5) do |http|
        request = Net::HTTP::Get.new(uri.request_uri)
        request['Range'] = 'bytes=0-31'
        response = http.request(request)
      end
      case response
      when Net::HTTPSuccess then [true, response.body.to_s, total_size(response)]
      when Net::HTTPRedirection
        redirects_left.positive? ? probe_image(URI.join(url, response['location']).to_s, redirects_left - 1) : [false, '']
      else [false, '']
      end
    rescue StandardError
      [false, '']
    end

    # A 206 answer gives the full size as the `Content-Range` total (`bytes 0-31/112844653`); a server that
    # ignores the range answers 200 with the whole body, sized by `Content-Length`.
    def total_size(response)
      total = response['Content-Range'].to_s[%r{/(\d+)\z}, 1]
      return total.to_i if total
      return response.content_length if response.is_a?(Net::HTTPOK)

      nil
    end

    # True when `bytes` sniff to a known image format that disagrees with the URL's filename extension.
    def image_format_conflict?(url, bytes)
      ext = url_extension(url)
      ext = 'jpeg' if ext == 'jpg'
      detected = detect_image_format(bytes)
      detected.present? && ext.present? && detected != ext
    end

    # The image format sniffed from leading magic bytes, or nil when the bytes aren't a recognised raster
    # image (a document, an SVG, too few bytes → no extension conflict inferred).
    def detect_image_format(bytes)
      head = bytes.to_s.b
      return 'png' if head.start_with?("\x89PNG\r\n\x1a\n".b)
      return 'jpeg' if head.start_with?("\xFF\xD8\xFF".b)
      return 'gif' if head.start_with?('GIF87a'.b, 'GIF89a'.b)
      return 'webp' if head[0, 4] == 'RIFF'.b && head[8, 4] == 'WEBP'.b
      return 'avif' if head[4, 4] == 'ftyp'.b && head[8, 4].to_s.include?('avif')

      nil
    end

    # Rewrites every rich-text `*_multiloc` HTML string through the block, including the text nodes
    # inside a layout's `craftjs_json` (the project description is a craft block, not a top-level multiloc).
    # The block also gets the record holding the HTML.
    def rewrite_multiloc_html!(template)
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.each do |key, value|
            if key.is_a?(String) && key.end_with?('_multiloc') && value.is_a?(Hash)
              value.transform_values! { |html| html.is_a?(String) ? yield(html, attrs) : html }
            elsif key == 'craftjs_json' && value.is_a?(Hash)
              rewrite_craftjs_text!(value) { |html| yield(html, attrs) }
            end
          end
        end
      end
    end

    # Rewrites the `text` multiloc HTML of every text node in a craftjs tree.
    def rewrite_craftjs_text!(craftjs)
      craftjs.each_value do |node|
        next unless craftjs_text_node?(node)

        text = node.dig('props', 'text')
        next unless text.is_a?(Hash)

        text.transform_values! { |html| html.is_a?(String) ? yield(html) : html }
      end
    end

    # Whether a craftjs node holds rich-text HTML in `props.text`: the native text widgets and the
    # `RichTextMultiloc` bridge, which holds bodies with images, video or buttons.
    def craftjs_text_node?(node)
      ContentBuilder::Layout::TEXT_CRAFTJS_NODE_TYPES.include?(craftjs_resolved_name(node))
    end

    # The craft component name of a node, or nil (the ROOT node's `type` is the plain string `'div'`).
    def craftjs_resolved_name(node)
      return nil unless node.is_a?(Hash)

      type = node['type']
      type['resolvedName'] if type.is_a?(Hash)
    end
  end
  # rubocop:enable Metrics/ModuleLength
end
