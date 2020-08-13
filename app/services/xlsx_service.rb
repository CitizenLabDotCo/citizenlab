class XlsxService

  include HtmlToPlainText

  @@multiloc_service = MultilocService.new

  def header_style s
    s.add_style  :bg_color => "99ccff", :fg_color => "2626ff", :sz => 16, :alignment => { :horizontal=> :center }
  end

  def generate_users_xlsx users, view_private_attributes: false
    areas = Area.all.map{|a| [a.id, a]}.to_h
    custom_field_columns = CustomField.with_resource_type('User')&.map(&:key).map do |key|
      {header: key, f: -> (u) { u.custom_field_values[key] }}
    end
    columns = [
      {header: 'id', f: -> (u) { u.id }, skip_sanitization: true},
      {header: 'email', f: -> (u) { u.email }},
      {header: 'first_name', f: -> (u) { u.first_name }},
      {header: 'last_name', f: -> (u) { u.last_name }},
      {header: 'slug', f: -> (u) { u.slug }, skip_sanitization: true},
      {header: 'gender', f: -> (u) { u.gender }},
      {header: 'verified', f: -> (u) { u.verified }, skip_sanitization: true},
      {header: 'birthyear', f: -> (u) { u.birthyear }},
      {header: 'domicile', f: -> (u) { @@multiloc_service.t(areas[u.domicile]&.title_multiloc) }},
      {header: 'education', f: -> (u) { u.education }},
      {header: 'created_at', f: -> (u) { u.created_at }, skip_sanitization: true},
      *custom_field_columns
    ]
    if !view_private_attributes
      priv_attrs = %w(email gender verified birthyear domicile education)
      priv_attrs += custom_field_columns.map{|c| c[:header]}
      columns.select! do |c|
        !priv_attrs.include?(c[:header])
      end
    end
    generate_xlsx 'Users', columns, users
  end

  def generate_ideas_xlsx ideas, view_private_attributes: false
    columns = [
      {header: 'id', f: -> (i) { i.id }, skip_sanitization: true},
      {header: 'title', f: -> (i) { @@multiloc_service.t(i.title_multiloc) }},
      {header: 'body', f: -> (i) { convert_to_text(@@multiloc_service.t(i.body_multiloc)) }},
      {header: 'author_name', f: -> (i) { i.author_name }},
      {header: 'author_email', f: -> (i) { i.author&.email }},
      {header: 'publication_status', f: -> (i) { i.publication_status }, skip_sanitization: true},
      {header: 'published_at', f: -> (i) { i.published_at }, skip_sanitization: true},
      {header: 'upvotes_count', f: -> (i) { i.upvotes_count }, skip_sanitization: true},
      {header: 'downvotes_count', f: -> (i) { i.downvotes_count }, skip_sanitization: true},
      {header: 'baskets_count', f: -> (i) { i.baskets_count }, skip_sanitization: true},
      {header: 'url', f: -> (i) { Frontend::UrlService.new.model_to_url(i) }, skip_sanitization: true},
      {header: 'project', f: -> (i) { @@multiloc_service.t(i&.project&.title_multiloc) }},
      {header: 'topics', f: -> (i) { i.topics.map{|t| @@multiloc_service.t(t.title_multiloc)}.join(',') }},
      {header: 'areas', f: -> (i) { i.areas.map{|a| @@multiloc_service.t(a.title_multiloc)}.join(',') }},
      {header: 'idea_status', f: -> (i) { @@multiloc_service.t(i&.idea_status&.title_multiloc) }},
      {header: 'assignee', f: -> (i) { i.assignee&.display_name }},
      {header: 'assignee_email', f: -> (i) { i.assignee&.email }},
      {header: 'latitude', f: -> (i) { i.location_point&.coordinates&.last }, skip_sanitization: true},
      {header: 'longitude', f: -> (i) { i.location_point&.coordinates&.first }, skip_sanitization: true},
      {header: 'location_description', f: -> (i) { i.location_description }},
      {header: 'comments_count', f: -> (i) { i.comments_count }, skip_sanitization: true},
      {header: 'attachments_count', f: -> (i) { i.idea_files.size }, skip_sanitization: true},
      {header: 'attachmens', f: -> (i) { i.idea_files.map{|f| f.file.url}.join("\n") }, skip_sanitization: true}
    ]
    if !view_private_attributes
      columns.select! do |c|
        !%w(author_email assignee_email).include?(c[:header])
      end
    end
    generate_xlsx 'Ideas', columns, ideas
  end

  def generate_initiatives_xlsx initiatives
    # TODO hide private attributes for non-admins
    pa = Axlsx::Package.new
    wb = pa.workbook
    wb.styles do |s|
      wb.add_worksheet(name: 'Initiatives') do |sheet|
        sheet.add_row [
          'id',
          'title',
          'body',
          'author_name',
          'author_email',
          'publication_status',
          'published_at',
          'upvotes_count',
          'url',
          'topics',
          'areas',
          'initiative_status',
          'assignee',
          'assignee_email'
        ], style: header_style(s)
        initiatives.each do |initiative|
          sheet.add_row [
            initiative.id,
            @@multiloc_service.t(initiative.title_multiloc),
            convert_to_text(@@multiloc_service.t(initiative.body_multiloc)),
            initiative.author_name,
            initiative.author&.email,
            initiative.publication_status,
            initiative.published_at,
            initiative.upvotes_count,
            Frontend::UrlService.new.model_to_url(initiative),
            initiative.topics.map{|t| @@multiloc_service.t(t.title_multiloc)}.join(','),
            initiative.areas.map{|a| @@multiloc_service.t(a.title_multiloc)}.join(','),
            @@multiloc_service.t(initiative&.initiative_status&.title_multiloc),
            initiative.assignee&.display_name,
            initiative.assignee&.email
          ]
        end
        sheet.column_info[2].width = 65
      end
    end
    pa.to_stream
  end

  def generate_idea_comments_xlsx comments
    # TODO hide private attributes for non-admins
    pa = Axlsx::Package.new
    wb = pa.workbook
    wb.styles do |s|
      wb.add_worksheet(name: "Comments") do |sheet|
        sheet.add_row [
          "id",
          "idea",
          "body",
          "upvotes_count",
          "author_name",
          "author_email",
          "created_at",
          "parent",
          "project",
        ], style: header_style(s)
        comments.each do |comment|
          sheet.add_row [
            comment.id,
            @@multiloc_service.t(comment&.post.title_multiloc),
            convert_to_text(@@multiloc_service.t(comment.body_multiloc)),
            comment.upvotes_count,
            comment.author_name,
            comment.author&.email,
            comment.created_at,
            comment.parent_id,
            ((comment&.post_type == 'Idea') && @@multiloc_service.t(comment&.idea&.project&.title_multiloc))
          ]
        end
        sheet.column_info[1].width = 65
      end
    end
    pa.to_stream
  end

  def generate_initiative_comments_xlsx comments
    # TODO hide private attributes for non-admins
    pa = Axlsx::Package.new
    wb = pa.workbook
    wb.styles do |s|
      wb.add_worksheet(name: 'Comments') do |sheet|
        sheet.add_row [
          'id',
          'initiative',
          'body',
          'upvotes_count',
          'author_name',
          'author_email',
          'created_at',
          'parent',
        ], style: header_style(s)
        comments.each do |comment|
          sheet.add_row [
            comment.id,
            @@multiloc_service.t(comment&.post.title_multiloc),
            convert_to_text(@@multiloc_service.t(comment.body_multiloc)),
            comment.upvotes_count,
            comment.author_name,
            comment.author&.email,
            comment.created_at,
            comment.parent_id
          ]
        end
        sheet.column_info[1].width = 65
      end
    end
    pa.to_stream
  end

  def invite_fields
    {
      token: -> (i) {i.token },
      invite_status: -> (i) { i.invitee.invite_status },
      email: -> (i) {i.invitee.email },
      first_name: -> (i) {i.invitee.first_name },
      last_name: -> (i) {i.invitee.last_name },
      locale: -> (i) {i.invitee.locale},
      groups: -> (i) {i.invitee.manual_groups.map{|g| @@multiloc_service.t(g.title_multiloc)}.join(',')},
      admin: -> (i) {i.invitee.admin?}
    }
  end

  def generate_invites_xlsx invites
    # TODO hide private attributes for non-admins
    fields = invite_fields
    hash_array = invites.map do |invite|
      fields.each_with_object({}){|(field, f), object| object[field] = f.call(invite)}
    end
    hash_array_to_xlsx(hash_array)
  end

  # Converts this hash array: 
  #   [{'name' => 'Ron', 'size' => 'xl'), {'name' => 'John', 'age' => 35}]
  # into this xlsx:
  # | name  | size | age |
  # | Ron   | xl   |     |
  # | John  |      | 35  |
  def hash_array_to_xlsx hash_array
    headers = hash_array.flat_map{|hash| hash.keys}.uniq

    pa = Axlsx::Package.new
    wb = pa.workbook

    wb.styles do |s|
      wb.add_worksheet do |sheet|
        sheet.add_row headers, style: header_style(s)
        hash_array.each do |hash|
          sheet.add_row headers.map{|header| hash[header]}
        end
      end
    end
    
    pa.to_stream
  end

  # Converts this xlsx:
  # | name  | size | age |
  # | Ron   | xl   |     |
  # | John  |      | 35  |
  # into this hash array: 
  #   [{'name' => 'Ron', 'size' => 'xl'), {'name' => 'John', 'age' => 35}]
  def xlsx_to_hash_array xlsx
    workbook = RubyXL::Parser.parse_buffer(xlsx)
    worksheet = workbook.worksheets[0]
    worksheet.drop(1).map do |row|
      (row&.cells || []).compact.map do |cell|
        [worksheet[0][cell.column]&.value, cell.value] if cell.value
      end.compact.to_h
    end.compact
  end


  private 

  def generate_xlsx sheetname, columns, instances
    columns = columns.uniq{ |c| c[:header] }
    pa = Axlsx::Package.new
    wb = pa.workbook
    wb.styles do |s|
      wb.add_worksheet(name: sheetname) do |sheet|
        header = columns.map{|c| c[:header]}
        sheet.add_row header, style: header_style(s)
        instances.each do |instance|
          row = columns.map do |c|
            value = c[:f].call instance
            if c[:skip_sanitization]
              value 
            else 
              value
              # sanitize_text_value value.to_s
            end
          end
          sheet.add_row row
        end
      end
    end
    pa.to_stream
  end

  def sanitize_text_value text
    text = text.gsub "=", "'="
    text.gsub!       "+", "'+"
    text.gsub        "-", "'-"
  end

end