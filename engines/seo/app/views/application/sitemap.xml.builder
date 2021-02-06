xml.instruct! :xml, version: '1.0'
xml.urlset xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9', 'xmlns:xhtml': 'http://www.w3.org/1999/xhtml' do |urlset|
  multilingual_sitemap_entry(
    xml,
    locales,
    "https://#{@host}",
    1
  )

  multilingual_sitemap_entry(
    xml,
    locales,
    "https://#{@host}/sign-in",
    0.2
  )

  multilingual_sitemap_entry(
    xml,
    locales,
    "https://#{@host}/sign-up",
    0.2
  )

  @projects.each do |project|
    multilingual_sitemap_entry(
      xml,
      locales,
      project.href,
      project.publication_status == 'published' ? 0.7 : 0.3,
      project.updated_at
    )

    multilingual_sitemap_entry(
      xml,
      locales,
      "#{project.href}/info",
      project.publication_status == 'published' ? 0.7 : 0.3,
      project.updated_at
    )

    if project.process_type == 'timeline'
      multilingual_sitemap_entry(
        xml,
        locales,
        "#{project.href}/process",
        project.publication_status == 'published' ? 0.6 : 0.2,
        project.updated_at
      )
    end

    multilingual_sitemap_entry(
      xml,
      locales,
      "#{project.href}/events",
      project.publication_status == 'published' ? 0.4 : 0.2,
      project.updated_at
    )
  end

  @ideas.each do |idea|
    multilingual_sitemap_entry(
      xml,
      locales,
      idea.href,
      0.3,
      idea.updated_at
    )
  end

  if AppConfiguration.instance.setting_activated?('initiatives')
    @initiatives.each do |initiative|
      multilingual_sitemap_entry(
        xml,
        locales,
        initiative.href,
        0.4,
        initiative.updated_at
      )
    end
  end

  if AppConfiguration.instance.setting_activated?('folders')
    @folders.each do |folder|
      multilingual_sitemap_entry(
        xml,
        locales,
        folder.href,
        folder.publication_status == 'published' ? 0.6 : 0.2,
        folder.updated_at
      )
    end
  end

  if AppConfiguration.instance.setting_activated?('pages')
    @pages.each do |page|
      multilingual_sitemap_entry(
        xml,
        locales,
        page.href,
        0.4,
        page.updated_at
      )
    end
  end

  if AppConfiguration.instance.setting_activated?('ideas_overview')
    multilingual_sitemap_entry(
      xml,
      locales,
      "https://#{@host}/ideas",
      0.7
    )
  end

  if AppConfiguration.instance.setting_activated?('initiatives')
    multilingual_sitemap_entry(
      xml,
      locales,
      "https://#{@host}/initiatives",
      0.8
    )
  end
end
