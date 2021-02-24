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

    if project.process_type == 'timeline'
      multilingual_sitemap_entry(
        xml,
        "#{front_end_url_for(project)}/process",
        project.admin_publication.publication_status == 'published' ? 0.6 : 0.2,
        project.updated_at
      )
    end
  end

  @ideas.each do |idea|
    multilingual_sitemap_entry(
      xml,
      front_end_url_for(idea),
      0.3,
      idea.updated_at
    )
  end

  if AppConfiguration.instance.feature_activated?('initiatives')
    @initiatives.each do |initiative|
      multilingual_sitemap_entry(
        xml,
        front_end_url_for(initiative),
        0.4,
        initiative.updated_at
      )
    end
  end

  if AppConfiguration.instance.feature_activated?('pages')
    @pages.each do |page|
      multilingual_sitemap_entry(
        xml,
        front_end_url_for(page),
        0.4,
        page.updated_at
      )
    end
  end

  if AppConfiguration.instance.feature_activated?('ideas_overview')
    multilingual_sitemap_entry(
      xml,
      "https://#{@host}/ideas",
      0.7
    )
  end

  if AppConfiguration.instance.feature_activated?('initiatives')
    multilingual_sitemap_entry(
      xml,
      "https://#{@host}/initiatives",
      0.8
    )
  end

  render_outlet 'seo.sitemap', xml: xml
end
