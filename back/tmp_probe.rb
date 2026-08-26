Apartment::Tenant.switch('localhost') do
  pages = StaticPage.where(code: 'custom', project_id: nil)
  puts "custom pages: #{pages.count}"
  puts "custom_page layouts: #{ContentBuilder::Layout.where(content_buildable_type: 'StaticPage', code: 'custom_page').count}"
  puts "advanced_custom_pages: #{AppConfiguration.instance.feature_activated?('advanced_custom_pages')}"
  puts "custom_page_builder: #{AppConfiguration.instance.feature_activated?('custom_page_builder')}"
  puts "filter types: #{pages.group(:projects_filter_type).count}"
end
