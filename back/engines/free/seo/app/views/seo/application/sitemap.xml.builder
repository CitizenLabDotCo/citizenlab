xml.instruct! :xml, version: '1.0'
xml.urlset xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9', 'xmlns:xhtml': 'http://www.w3.org/1999/xhtml' do |urlset|
  multilingual_sitemap_entry(
    xml,
    "https://#{@host}",
    1
  )

  multilingual_sitemap_entry(
    xml,
    "https://#{@host}/sign-in",
    0.2
  )

  multilingual_sitemap_entry(
    xml,
    "https://#{@host}/sign-up",
    0.2
  )

  @projects.each do |project|
    multilingual_sitemap_entry(
      xml,
      front_end_url_for(project),
      project.admin_publication.publication_status == 'published' ? 0.7 : 0.3,
      project.updated_at
    )

    multilingual_sitemap_entry(
      xml,
      "#{front_end_url_for(project)}/info",
      project.admin_publication.publication_status == 'published' ? 0.7 : 0.3,
      project.updated_at
    )

    multilingual_sitemap_entry(
      xml,
      "#{front_end_url_for(project)}/events",
      project.admin_publication.publication_status == 'published' ? 0.4 : 0.2,
      project.updated_at
    )

    multilingual_sitemap_entry(
      xml,
      "#{front_end_url_for(project)}/process",
      project.admin_publication.publication_status == 'published' ? 0.6 : 0.2,
      project.updated_at
    )
  end

  @folders.each do |folder|
    multilingual_sitemap_entry(
      xml,
      front_end_url_for(folder),
      folder.admin_publication.publication_status == 'published' ? 0.6 : 0.2,
      folder.updated_at
    )
  end

  @ideas.each do |idea|
    multilingual_sitemap_entry(
      xml,
      front_end_url_for(idea),
      0.3,
      idea.updated_at
    )
  end

  @pages.each do |page|
    multilingual_sitemap_entry(
      xml,
      front_end_url_for(page),
      0.4,
      page.updated_at
    )
  end
  %w[cookie-policy accessibility-statement].each do |slug|
    multilingual_sitemap_entry(
      xml,
      "https://#{@host}/pages/#{slug}",
      0.4
    )
  end

  if NavBarItem.where(code: 'all_input').exists?
    multilingual_sitemap_entry(
      xml,
      "https://#{@host}/ideas",
      0.7
    )
  end

  render_outlet 'seo.sitemap', xml: xml
end
