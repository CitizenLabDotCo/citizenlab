# == Schema Information
#
# Table name: content_builder_layouts
#
#  id                     :uuid             not null, primary key
#  craftjs_jsonmultiloc   :jsonb
#  content_buildable_type :string           not null
#  content_buildable_id   :uuid             not null
#  code                   :string           not null
#  enabled                :boolean          default(FALSE), not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_content_builder_layouts_content_buidable_type_id_code  (content_buildable_type,content_buildable_id,code) UNIQUE
#
module ContentBuilder
  class Layout < ApplicationRecord
    belongs_to :content_buildable, polymorphic: true

    before_validation :sanitize_craftjs_jsonmultiloc

    validates :content_buildable, :code, presence: true
    validates :craftjs_jsonmultiloc, multiloc: { presence: false, value_type: Hash }
    validate :validate_craftjs_jsonmultiloc

    private

    def validate_craftjs_jsonmultiloc
      validate_whitelisted_iframe_urls
    end

    def validate_whitelisted_iframe_urls
      iframe_sanitizer = ::SanitizationService::IframeScrubber.new
      url_sanitizer = ::UrlSanitizationService::UrlScrubber.new

      craftjs_jsonmultiloc.each do |locale, json|
        json.each do |key, elt|
          next if key == 'ROOT' || elt.dig('type', 'resolvedName') != 'Iframe'

          url = elt.dig 'props', 'url'
          if url && (!iframe_sanitizer.video_whitelisted?(url) && !url_sanitizer.url_whitelisted?(url))
            errors.add :craftjs_jsonmultiloc, :iframe_url_not_whitelisted, locale: locale, url: url
          end
        end
      end
    end

    def sanitize_craftjs_jsonmultiloc
      self.craftjs_jsonmultiloc = LayoutSanitizationService.new.sanitize_multiloc craftjs_jsonmultiloc
    end
  end
end
