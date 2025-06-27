# frozen_string_literal: true

class XlsxService
  # Converts this hash array:
  #   [{'name' => 'Ron', 'size' => 'xl'), {'name' => 'John', 'age' => 35}]
  # into this xlsx:
  # | name  | size | age |
  # | Ron   | xl   |     |
  # | John  |      | 35  |
  def hash_array_to_xlsx(hash_array)
    headers = hash_array.flat_map(&:keys).uniq

    pa = Axlsx::Package.new
    wb = pa.workbook

    wb.styles do |s|
      wb.add_worksheet do |sheet|
        sheet.add_row remove_duplicate_header_suffix(headers), style: header_style(s)
        hash_array.each do |hash|
          sheet.add_row(headers.map { |header| hash[header] })
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
  def xlsx_to_hash_array(xlsx)
    workbook = RubyXL::Parser.parse_buffer(xlsx)
    worksheet = workbook.worksheets[0]
    worksheet.drop(1).map do |row|
      xlsx_utils = Export::Xlsx::Utils.new
      (row&.cells || []).compact.filter_map do |cell|
        if cell.value
          column_header = xlsx_utils.add_duplicate_column_name_suffix(worksheet[0][cell.column]&.value)
          [column_header, cell.value]
        end
      end.to_h
    end
  end

  def xlsx_from_rows(rows, sheetname: 'sheet 1')
    header, *rows = rows

    instances = rows.map { |row| header.zip(row).to_h }
    columns = header.map do |colname|
      { header: colname, f: ->(item) { item[colname] } }
    end

    generate_xlsx(sheetname, columns, instances)
  end

  def xlsx_from_columns(columns, sheetname: 'sheet 1')
    header = columns.keys
    rows = columns.values.transpose
    xlsx_from_rows([header, *rows], sheetname: sheetname)
  end

  def generate_xlsx(sheetname, columns, instances)
    columns = columns.uniq { |c| c[:header] }
    pa = Axlsx::Package.new
    generate_sheet pa.workbook, sheetname, columns, instances
    pa.to_stream
  end

  def generate_sheet(workbook, sheetname, columns, instances)
    utils = Export::Xlsx::Utils.new
    sheetname = utils.sanitize_sheetname sheetname
    columns = columns.uniq { |c| c[:header] }
    workbook.styles do |s|
      workbook.add_worksheet(name: sheetname) do |sheet|
        header = columns.pluck(:header)
        column_widths = columns.pluck(:width)
        sheet.column_widths(*column_widths)
        sheet.add_row header, style: header_style(s)
        instances.each do |instance|
          row = columns.map do |c|
            value = c[:f].call instance
            if c[:skip_sanitization]
              value
            else
              utils.escape_formula value.to_s
            end
          end
          sheet.add_row row
        end
        hyperlink_indexes = columns.each_index.select do |idx|
          columns[idx][:hyperlink]
        end
        utils.add_hyperlinks sheet, hyperlink_indexes
      end
    end
  end

  def generate_time_stats_xlsx(serie, name)
    columns = [
      { header: 'date',   f: ->(item) { item[0] } },
      { header: 'amount', f: ->(item) { item[1] } }
    ]
    generate_xlsx name, columns, serie
  end

  def generate_res_stats_xlsx(serie, resource_name, grouped_by)
    grouped_by_id = "#{grouped_by}_id"
    columns = [
      { header: grouped_by,    f: ->(item) { item[grouped_by] } },
      { header: grouped_by_id, f: ->(item) { item[grouped_by_id] } },
      { header: resource_name, f: ->(item) { item[resource_name] } }
    ]
    generate_xlsx "#{resource_name}_by_#{grouped_by}", columns, serie
  end

  def generate_users_xlsx(users, view_private_attributes: false)
    url_service = Frontend::UrlService.new
    columns = [
      { header: 'id', f: ->(u) { u.id }, skip_sanitization: true },
      { header: 'email', f: ->(u) { u.email } },
      { header: 'first_name', f: ->(u) { u.first_name } },
      { header: 'last_name', f: ->(u) { u.last_name } },
      { header: 'profile_page', f: ->(u) { url_service.model_to_url(u) }, skip_sanitization: true }, # Not hyperlinked, as significantly faster without this style
      { header: 'created_at', f: ->(u) { u.created_at }, skip_sanitization: true },
      { header: 'registration_completed_at', f: ->(u) { u.registration_completed_at }, skip_sanitization: true },
      { header: 'invite_status', f: ->(u) { u.invite_status }, skip_sanitization: true },
      *user_custom_field_columns(:itself)
    ]
    columns.reject! { |c| %w[id email first_name last_name].include?(c[:header]) } unless view_private_attributes

    generate_xlsx 'Users', columns, users
  end

  def generate_idea_xlsx_columns(_ideas, view_private_attributes: false, with_tags: false, with_cosponsors: false)
    columns = [
      { header: 'id',                   f: ->(i) { i.id }, skip_sanitization: true },
      { header: 'title',                f: ->(i) { multiloc_service.t(i.title_multiloc) } },
      { header: 'description',          f: ->(i) { Export::Xlsx::Utils.new.convert_to_text_long_lines(multiloc_service.t(i.body_multiloc)) }, width: 10 },
      { header: 'author_name',          f: ->(i) { format_author_name i } },
      { header: 'author_email',         f: ->(i) { i.author&.email } },
      { header: 'author_id',            f: ->(i) { i.author_id } },
      { header: 'proposed_budget',      f: ->(i) { i.proposed_budget },                                                    skip_sanitization: true },
      { header: 'published_at',         f: ->(i) { i.published_at },                                                       skip_sanitization: true },
      { header: 'submitted_at',         f: ->(i) { i.submitted_at },                                                       skip_sanitization: true },
      { header: 'comments',             f: ->(i) { i.comments_count },                                                     skip_sanitization: true },
      { header: 'likes',                f: ->(i) { i.likes_count }, skip_sanitization: true },
      { header: 'dislikes',             f: ->(i) { i.dislikes_count }, skip_sanitization: true },
      { header: 'unsure',               f: ->(i) { i.neutral_reactions_count }, skip_sanitization: true },
      { header: 'url',                  f: ->(i) { Frontend::UrlService.new.model_to_url(i) }, skip_sanitization: true, hyperlink: true },
      { header: 'project',              f: ->(i) { multiloc_service.t(i&.project&.title_multiloc) } },
      { header: 'topics',               f: ->(i) { i.topics.map { |t| multiloc_service.t(t.title_multiloc) }.join(',') } },
      { header: 'status',               f: ->(i) { multiloc_service.t(i&.idea_status&.title_multiloc) } },
      { header: 'assignee',             f: ->(i) { i.assignee&.full_name } },
      { header: 'assignee_email',       f: ->(i) { i.assignee&.email } },
      { header: 'latitude',             f: ->(i) { i.location_point&.coordinates&.last },                                  skip_sanitization: true },
      { header: 'longitude',            f: ->(i) { i.location_point&.coordinates&.first },                                 skip_sanitization: true },
      { header: 'location_description', f: ->(i) { i.location_description } },
      { header: 'attachments',          f: ->(i) { i.idea_files.map { |f| f.file.url }.join("\n") }, skip_sanitization: true, width: 2 }
    ]

    if with_cosponsors
      columns.push(
        { header: 'cosponsors', f: ->(i) { i.cosponsors.map(&:full_name).join(', ') }, skip_sanitization: true }
      )
    end

    columns.concat user_custom_field_columns(:author)
    columns.reject! { |c| %w[author_name author_email assignee assignee_email author_id].include?(c[:header]) } unless view_private_attributes
    columns
  end

  def generate_ideas_xlsx(ideas, view_private_attributes: false, with_tags: false, with_cosponsors: false)
    columns = generate_idea_xlsx_columns(ideas, view_private_attributes: view_private_attributes, with_tags:, with_cosponsors:)

    generate_xlsx 'Ideas', columns, ideas
  end

  def generate_comments_xlsx(comments, view_private_attributes: false)
    columns = [
      { header: 'id',                 f: ->(c) { c.id }, skip_sanitization: true },
      { header: 'input',              f: ->(c) { multiloc_service.t(c.idea.title_multiloc) } },
      { header: 'input_id',           f: ->(c) { c.idea.id } },
      { header: 'comment',            f: ->(c) { Export::Xlsx::Utils.new.convert_to_text_long_lines(multiloc_service.t(c.body_multiloc)) }, width: 10 },
      { header: 'likes_count', f: ->(c) { c.likes_count }, skip_sanitization: true },
      { header: 'author_name',        f: ->(c) { format_author_name c } },
      { header: 'author_email',       f: ->(c) { c.author&.email } },
      { header: 'author_id',          f: ->(i) { i.author_id } },
      { header: 'created_at',         f: ->(c) { c.created_at },    skip_sanitization: true },
      { header: 'parent_comment_id',  f: ->(c) { c.parent_id },     skip_sanitization: true },
      { header: 'project',            f: ->(c) { multiloc_service.t(c.idea.project.title_multiloc) } }
    ]
    columns.concat user_custom_field_columns(:author)
    columns.reject! { |c| %w[author_name author_email author_id].include?(c[:header]) } unless view_private_attributes
    generate_xlsx 'Comments', columns, comments
  end

  def generate_invites_xlsx(invites, view_private_attributes: false)
    columns = [
      { header: 'token',         f: ->(i) { i.token },                 skip_sanitization: true },
      { header: 'invite_status', f: ->(i) { i.invitee.invite_status }, skip_sanitization: true },
      { header: 'email',         f: ->(i) { i.invitee.email } },
      { header: 'first_name',    f: ->(i) { i.invitee.first_name } },
      { header: 'last_name',     f: ->(i) { i.invitee.last_name } },
      { header: 'locale',        f: ->(i) { i.invitee.locale }, skip_sanitization: true },
      { header: 'groups',        f: ->(i) { i.invitee.manual_groups.map { |g| multiloc_service.t(g.title_multiloc) }.join(',') }, skip_sanitization: true },
      { header: 'admin',         f: ->(i) { i.invitee.admin? }, skip_sanitization: true }
    ]
    columns.reject! { |c| c[:header] == 'email' } unless view_private_attributes
    generate_xlsx 'Invites', columns, invites
  end

  def user_custom_field_columns(record_to_user)
    # options keys are only unique in the scope of their field, namespacing to avoid collisions
    options = CustomFieldOption.all.index_by { |option| namespace(option.custom_field_id, option.key) }
    user_custom_fields = CustomField.registration.order(:ordering)

    fields_to_columns = map_user_custom_fields_to_columns(user_custom_fields)

    user_custom_fields&.map do |field|
      column_name = fields_to_columns[field.id]
      { header: column_name, f: value_getter_for_user_custom_field_columns(field, record_to_user, options) }
    end
  end

  def format_author_name(input)
    return input.author_name unless input.anonymous?

    I18n.t 'xlsx_export.anonymous'
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new app_configuration: AppConfiguration.instance
  end

  def title_multiloc_for(record, field, options)
    return unless record

    case record.custom_field_values[field.key]
    when Array
      record.custom_field_values[field.key].map do |key|
        multiloc_service.t(options[namespace(field.id, key)]&.title_multiloc)
      end.join(', ')
    when String
      multiloc_service.t(options[namespace(field.id, record.custom_field_values[field.key])]&.title_multiloc)
    end
  end

  def value_getter_for_user_custom_field_columns(field, record_to_user, options)
    if field.support_options? # field with options
      if field.domicile? # 'domicile' options are a special case
        options = field.ordered_transformed_options.index_by { |option| namespace(option.custom_field_id, option.key) }
      end

      lambda do |record|
        user = record.send(record_to_user)
        title_multiloc_for user, field, options
      end
    else # all other custom fields
      lambda do |record|
        user = record.send(record_to_user)
        user && user.custom_field_values[field.key]
      end
    end
  end

  def map_user_custom_fields_to_columns(user_custom_fields)
    fields_to_columns = {}

    user_custom_fields.group_by { |field| multiloc_service.t(field.title_multiloc) }.each do |title, fields|
      if fields.size == 1
        fields_to_columns[fields.first.id] = title
      else # add suffix to titles to distinguish between fields with same title
        fields.each_with_index { |field, i| fields_to_columns[field.id] = "#{title} (#{i + 1})" }
      end
    end

    fields_to_columns
  end

  def header_style(style)
    style.add_style b: true, alignment: { horizontal: :center, vertical: :top, wrap_text: true }
  end

  def namespace(field_id, option_key)
    "#{field_id}/#{option_key}"
  end

  # Remove any suffixes added for duplicate column names
  def remove_duplicate_header_suffix(headers)
    headers.map do |header|
      Export::Xlsx::Utils.new.remove_duplicate_column_name_suffix header
    end
  end
end

XlsxService.prepend(IdeaCustomFields::Patches::XlsxService)
XlsxService.prepend(BulkImportIdeas::Patches::XlsxService)
