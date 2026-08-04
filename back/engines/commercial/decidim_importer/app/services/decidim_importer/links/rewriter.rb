# frozen_string_literal: true

module DecidimImporter
  module Links
    # Post-import step (runs in the applied tenant): rewrites Decidim back-links in the tenant's Content
    # Builder layouts (project/folder descriptions) and static pages via a {Map}. File links resolve to
    # the imported file's `content.url`; unresolvable ones are returned as "broken" rows for a report.
    # Runs post-import because layouts, static pages and file URLs only exist once the template is
    # deserialized into the tenant.
    class Rewriter
      # Reads the mapping CSV beside the template. Raises if missing — guard on `File.exist?` first if
      # an absent mapping is acceptable.
      def self.from_csv(mapping_path)
        new(Map.read_csv(mapping_path))
      end

      def initialize(link_map)
        @map = link_map
      end

      # Number of records whose links were rewritten (set by {#run}).
      attr_reader :updated_count

      # Rewrites links across every layout and static page, saving changed ones. Returns broken links as
      # `{ old_url:, container_type:, container_id:, container_url: }` hashes — `container_url` being the
      # public page the reviewer can open to fix the link.
      def run
        @updated_count = 0
        broken = []
        ContentBuilder::Layout.find_each do |layout|
          changed, found = correct_layout_links(layout)
          save_changed(layout, changed)
          # A layout's container is its buildable (a Project or folder) — that's the page to link to.
          found.each { |url| broken << broken_link_row(url, layout.content_buildable) }
        end
        StaticPage.find_each do |page|
          changed, found = correct_static_page_links(page)
          save_changed(page, changed)
          found.each { |url| broken << broken_link_row(url, page) }
        end
        broken
      end

      private

      def save_changed(record, changed)
        return unless changed

        record.save!
        @updated_count += 1
      end

      # A file link resolves to the imported file's real content URL, memoised per id.
      def resolver
        @resolver ||= begin
          file_urls = Hash.new { |cache, id| cache[id] = Files::File.find_by(id: id)&.content&.url }
          ->(file_id) { file_urls[file_id] }
        end
      end

      # Applies the mapping to one layout's `TextMultiloc` fields. Returns `[changed?, broken_urls]`.
      # Reassigns `craftjs_json` (a deep dup) only on change, so ActiveRecord sees it dirty.
      def correct_layout_links(layout)
        craftjs = layout.craftjs_json
        return [false, []] unless craftjs.is_a?(Hash)

        craftjs = craftjs.deep_dup
        changed = false
        broken = []
        craftjs.each_value do |node|
          # ROOT's `type` is the plain string 'div', so guard before treating it as a component hash.
          next unless node.is_a?(Hash) && node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'TextMultiloc'

          text = node.dig('props', 'text')
          next unless text.is_a?(Hash)

          changed |= correct_multiloc!(text, broken)
        end
        layout.craftjs_json = craftjs if changed
        [changed, broken.uniq]
      end

      # Applies the mapping to a static page's top info section. Returns `[changed?, broken_urls]`.
      def correct_static_page_links(page)
        body = page.top_info_section_multiloc
        return [false, []] unless body.is_a?(Hash)

        body = body.deep_dup
        broken = []
        changed = correct_multiloc!(body, broken)
        page.top_info_section_multiloc = body if changed
        [changed, broken.uniq]
      end

      # Rewrites each locale's HTML of a `{ locale => html }` multiloc in place, appending any broken URLs
      # to `broken`. Returns whether anything changed.
      def correct_multiloc!(multiloc, broken)
        changed = false
        multiloc.each do |locale, html|
          new_html, found = @map.apply(html, file_resolver: resolver)
          broken.concat(found)
          next if new_html == html

          multiloc[locale] = new_html
          changed = true
        end
        changed
      end

      # A report row for one unresolved link: the URL plus its container's model name, id and public URL
      # (the page the reviewer opens to fix it). A missing container leaves the fields blank.
      def broken_link_row(url, container)
        {
          old_url: url,
          container_type: container&.model_name&.name,
          container_id: container&.id,
          container_url: container_url(container)
        }
      end

      def container_url(container)
        return nil unless container

        Frontend::UrlService.new.model_to_url(container)
      rescue StandardError
        nil
      end
    end
  end
end
