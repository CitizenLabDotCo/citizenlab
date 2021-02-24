folders.each do |folder|
  multilingual_sitemap_entry(
    xml,
    front_end_url_for(folder),
    folder.admin_publication.publication_status == 'published' ? 0.6 : 0.2,
    folder.updated_at
  )
end
