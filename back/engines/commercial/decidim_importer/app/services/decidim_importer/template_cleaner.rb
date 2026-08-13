# frozen_string_literal: true

require 'net/http'

module DecidimImporter
  # Cleans a loaded template hash before deserialize: prunes uploads the import can't fetch or store —
  # unreachable images, and files whose extension the upload allowlist rejects — (or strips them all when
  # fetching is off) and removes the file/craftjs nodes left dangling as a result.
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
    # extension isn't on the upload allowlist.
    def prepare_uploads!(template, import_uploads:)
      if import_uploads
        importable = {}
        prune_unreachable_remote_urls!(template, importable)
        prune_unreachable_embedded_images!(template, importable)
      else
        strip_remote_upload_urls!(template)
        strip_embedded_images!(template)
      end
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

    # Drops any `project_image` left without an image (pruned/stripped) — it would render as a broken card.
    def prune_imageless_project_images!(template)
      images = template.dig('models', 'project_image')
      return unless images

      images.reject! { |attrs| attrs['remote_image_url'].blank? && attrs['image'].blank? }
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
    # keeping the good ones for CarrierWave. Every drop is logged, since a silently missing attachment is
    # otherwise indistinguishable from one Decidim never had.
    def prune_unreachable_remote_urls!(template, importable = {})
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.reject! do |key, value|
            next false unless remote_upload_url?(key) && value.is_a?(String)

            reason = prune_reason(key, value, importable)
            log_pruned_upload(attrs, key, value, reason) if reason
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
    # extension before the network probe also saves a pointless request. Everything else just has to be
    # fetchable, and to match its own extension if it's a recognised raster image.
    def prune_reason(key, url, importable)
      if key == FILE_CONTENT_URL_KEY && !allowed_file_extension?(url)
        ext = url_extension(url)
        return "#{ext.present? ? ".#{ext}" : 'a missing extension'} is not on the upload allowlist"
      end

      importable[url] = image_prune_reason(url) unless importable.key?(url)
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

    # Records a dropped upload against the record's name where it has one (files do), else the attribute.
    def log_pruned_upload(attrs, key, url, reason)
      label = attrs['name'].presence || key
      Rails.logger.warn "Decidim import: dropping #{label} because #{reason} (#{url})"
    end

    def remote_upload_url?(key)
      key.is_a?(String) && key.start_with?('remote_') && key.end_with?('_url')
    end

    # Drops embedded `<img>` tags the import can't fetch, keeping the rest (and the text). `data:` images
    # are kept; a src that isn't `http(s)` (e.g. a root-relative `/rails/...` path) is dropped, since the
    # rich-text handler can't download it. Each distinct URL is probed once (cache shared with attachments)
    # and every drop is logged with its reason, distinguishing not-found from a format conflict.
    def prune_unreachable_embedded_images!(template, importable = {})
      rewrite_multiloc_html!(template) do |html|
        html.gsub(/<img\b[^>]*>/i) do |tag|
          src = tag[/\bsrc\s*=\s*["']?([^"' >]+)/i, 1]
          next tag if src.nil? || src.start_with?('data:')
          next '' unless src.match?(%r{\Ahttps?://}i)

          importable[src] = image_prune_reason(src) unless importable.key?(src)
          reason = importable[src]
          next tag unless reason

          Rails.logger.warn "Decidim import: dropping embedded image because #{reason} (#{src})"
          ''
        end
      end
    end

    # Why the import can't safely fetch a remote image, or nil when it can. Two distinct failures, kept
    # apart so the log says which it was: the image can't be found (unreachable — 404, connection error or
    # timeout), or it's reachable but its content type disagrees with its filename extension. Decidim
    # sometimes serves e.g. a JPEG named `.png`, which Go Vocal's exiftool then rejects, aborting the whole
    # import; such images are dropped too.
    def image_prune_reason(url)
      reachable, bytes = probe_image(url)
      return 'it could not be found' unless reachable
      return 'its content conflicts with its extension' if image_format_conflict?(url, bytes)

      nil
    end

    # A single ranged GET (following redirects): `[reachable?, leading_bytes_of_body]`. Ranged GET not
    # HEAD, because Active Storage's presigned S3 redirects are signed GET-only and 403 a HEAD probe;
    # the first bytes are enough to sniff the format (see {.detect_image_format}).
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
      when Net::HTTPSuccess then [true, response.body.to_s]
      when Net::HTTPRedirection
        redirects_left.positive? ? probe_image(URI.join(url, response['location']).to_s, redirects_left - 1) : [false, '']
      else [false, '']
      end
    rescue StandardError
      [false, '']
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

    # Rewrites every rich-text `*_multiloc` HTML string through the block, including the `TextMultiloc`
    # text inside a layout's `craftjs_json` (the project description is a craft block, not a top-level multiloc).
    def rewrite_multiloc_html!(template, &block)
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.each do |key, value|
            if key.is_a?(String) && key.end_with?('_multiloc') && value.is_a?(Hash)
              value.transform_values! { |html| html.is_a?(String) ? yield(html) : html }
            elsif key == 'craftjs_json' && value.is_a?(Hash)
              rewrite_craftjs_text!(value, &block)
            end
          end
        end
      end
    end

    # Rewrites the `text` multiloc HTML of every `TextMultiloc` node in a craftjs tree.
    def rewrite_craftjs_text!(craftjs)
      craftjs.each_value do |node|
        next unless craftjs_resolved_name(node) == 'TextMultiloc'

        text = node.dig('props', 'text')
        next unless text.is_a?(Hash)

        text.transform_values! { |html| html.is_a?(String) ? yield(html) : html }
      end
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
