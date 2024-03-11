# frozen_string_literal: true

namespace :single_use do
  desc 'Fix existing layouts'
  task migrate_deprecated_title_widget: [:environment] do |_t, _args|
    content_buildable_type = 'ReportBuilder::Report'

    def resolved_name(elt)
      type = elt['type']
      type['resolvedName'] if type.is_a?(Hash)
    end

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        Rails.logger.info tenant.host

        layouts = ContentBuilder::Layout.where(content_buildable_type: content_buildable_type)
        layouts.each do |layout|
          layout.craftjs_json.each do |(_id, elt)|
            elt['custom'] = {} # we previously stored some data here, but it's not used

            next if resolved_name(elt) != 'TitleMultiloc'

            elt['type']['resolvedName'] = 'TextMultiloc'
            elt['custom'] = {}
            elt['props']['text'].transform_values! { |text| "<h2>#{text}</h2>" }
          end

          if layout.changed?
            layout.save!
            Rails.logger.info "Updated #{layout.id}"
          end
        end
      end
    end
  end
end
