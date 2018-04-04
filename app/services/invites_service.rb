require 'rubyXL'

class InvitesService

  attr_accessor :errors

  MAX_INVITES = 1000

  class InvitesFailedError < RuntimeError; 
    attr_accessor :errors

    def initialize options
      @errors = options[:errors]
    end

    def to_h
      errors.map(&:to_h)
    end
  end

  class InviteError < RuntimeError
    attr_accessor :error_key, :row, :rows, :value, :raw_error

    def initialize error_key, options
      @error_key = error_key
      @row = options[:row]
      @rows = options[:rows]
      @value = options[:value]
      @raw_error = options[:raw_error]
    end

    def to_h
      h = { error: error_key }
      h[:row] = row if row
      h[:rows] = rows if rows
      h[:value] = value if value
      h[:raw_error] = raw_error if raw_error
      h
    end
  end


  INVITE_ERRORS = {
    unparseable_excel: 'unparseable_excel',
    max_invites_limit_exceeded: 'max_invites_limit_exceeded',
    no_invites_specified: 'no_invites_specified',
    unknown_group: 'unknown_group',
    malformed_admin_value: 'malformed_admin_value',
    malformed_groups_value: 'malformed_groups_value',
    unknown_locale: 'unknown_locale',
    invalid_email: 'invalid_email',
    invalid_row: 'invalid_row',
    email_already_invited: 'email_already_invited',
    email_already_active: 'email_already_active',
    emails_duplicate: 'emails_duplicate',
  }


  def initialize
    @errors = []
  end

  def bulk_create_xlsx file, default_params={}, inviter=nil
    hash_array = xlsx_to_hash_array(file)
    invites = build_invites(hash_array, default_params, inviter)
    pre_check_invites(invites)
    if @errors.empty?
      save_invites(invites)
    else
      fail_now
    end
  rescue InvitesFailedError => e
    e.errors.each do |e|
      e.row && (e.row += 2)
      e.rows&.map!{|r| r+2}
    end
    raise e
  end

  def bulk_create emails, default_params={}, inviter=nil
    hash_array = emails.map{|e| {"email" => e}}
    invites = build_invites(hash_array, default_params, inviter)
    pre_check_invites(invites)
    if @errors.empty?
      save_invites(invites)
    else
      fail_now
    end
  end

  # def generate_example_xlsx
  #   XlsxService.new.hash_array_to_xlsx [
  #     {
  #       email: 'someuser@somedomain.com',
  #       first_name: 'John',
  #       last_name: 'Johnson',
  #       locale: Tenant.settings('core', 'locales').first,
  #       groups: MultilocService.new.t(Group.first&.title_multiloc),
  #       admin: false,
  #     }
  #   ]
  # end

  def generate_example_xlsx
    headers = ['email', 'first_name', 'last_name', 'locale', 'groups', 'admin']
    pa = Axlsx::Package.new
    wb = pa.workbook

    wb.styles do |s|
      wb.add_worksheet do |sheet|
        sheet.add_row headers

        sheet.add_row [
          'someuser@somedomain.com',
          'John',
          'Johnson',
          Tenant.settings('core', 'locales').first,
          MultilocService.new.t(Group.first&.title_multiloc),
          'FALSE'
        ]
        
        sheet.add_data_validation("F2:F1001", {
          :type => :list,
          :formula1 => '"TRUE, FALSE"',
          :showDropDown => false,
        })

        sheet.add_data_validation("D2:D1001", {
          :type => :list,
          :formula1 => "\"#{Tenant.settings('core', 'locales').join(',')}\"",
          :showDropDown => false,
        })
      end
    end
    pa.to_stream
  end

  private

  def xlsx_to_hash_array file
    XlsxService.new.xlsx_to_hash_array(file).each.with_index do |hash, row_index|
      if hash['groups']
        hash['group_ids'] = xlsx_groups_to_group_ids(hash['groups'], row_index)
      end
      hash.delete('groups')

      if hash['admin'].present?
        hash['roles'] = xlsx_admin_to_roles(hash['admin'], row_index)
      end
      hash.delete('admin')

    end
  rescue Exception => e
    add_error(:unparseable_excel, raw_error: e.to_s)
  end

  def xlsx_groups_to_group_ids groups, row_index
    groups.split(',').map do |group_title|
      stripped_group_title = group_title.strip
      group = Group.all.find{|g| g.title_multiloc.values.map(&:strip).include? stripped_group_title}&.id
      group || (add_error(:unknown_group, row: row_index, value: stripped_group_title) && nil)
    end.compact
  rescue Exception => e
    add_error(:malformed_groups_value, row: row_index, value: groups, raw_error: e.to_s)
    []
  end

  def xlsx_admin_to_roles admin, row_index
    if [true, "TRUE", "true", "1", 1].include? admin
      [{"type" => "admin"}]
    elsif [false, "FALSE", "false", "0", 0].include? admin
      []
    else
      add_error(:malformed_admin_value, row: row_index, value: admin)
      []
    end
  end

  def build_invites hash_array, default_params={}, inviter=nil
    if hash_array.size > MAX_INVITES
      add_error(:max_invites_limit_exceeded, row: hash_array.size, value: MAX_INVITES)
      fail_now
    elsif hash_array.size == 0
      add_error(:no_invites_specified)
      fail_now
    else
      hash_array.map do |invite_params|
        invite = build_invite(invite_params, default_params, inviter)
      end
    end
  end

  def build_invite params, default_params={}, inviter=nil
    invitee = User.new({
      email: params["email"],
      first_name: params["first_name"], 
      last_name: params["last_name"], 
      locale: params["locale"] || default_params["locale"] || Tenant.settings('core', 'locales').first, 
      group_ids: params["group_ids"] || default_params["group_ids"] || [],
      roles: params["roles"] || default_params["roles"] || [],
      invite_status: 'pending'
    })
    Invite.new(invitee: invitee, inviter: inviter, invite_text: params["invite_text"] || default_params["invite_text"])
  end

  def pre_check_invites invites
    #check duplicate emails
    invites.each_with_object(Hash.new{[]}).with_index do |(invite, object), index|
      object[invite.invitee.email] += [index]
    end
    .select{|email, row_indexes| email && row_indexes.size > 1}
    .each do |email, row_indexes|
      add_error(:emails_duplicate, rows: row_indexes, value: email)
    end
    #run validations
    invites.each{|invite| validate_invite(invites, invite)}
  end


  def validate_invite invites, invite
    invite.invitee.validate!
    invite.validate!
  rescue ActiveRecord::RecordInvalid => e
    row = invites.find_index{|i| i.invitee == e.record || i == e.record}
    e.record.errors.details.each do |field, error_descriptors|
      error_descriptors.each do |error_descriptor|
        if field == :locale
          add_error(:unknown_locale, row: row, value: error_descriptors.first[:value], raw_error: e)
        elsif field == :email && error_descriptor[:error] == :invalid
          add_error(:invalid_email, row: row, value: error_descriptor[:value], raw_error: e)
        elsif field == :email && error_descriptor[:error] == :taken
          if (User.find_by(email: e.record.email).invite_status == 'pending')
            add_error(:email_already_invited, row: row, value: error_descriptor[:value], raw_error: e)
          else
            add_error(:email_already_active, row: row, value: error_descriptor[:value], raw_error: e)
          end
        else
          add_error(:invalid_row, row: row, value: field, raw_error: e)
        end
      end
    end
  end

  def save_invites invites
    ActiveRecord::Base.transaction do
      invites.each do |invite|
        invite.invitee.save
        invite.save
        SideFxInviteService.new.after_create(invite, invite.inviter)
      end
    end
  rescue Exception => e
    byebug
  end

  def add_error key, options={}
    @errors << InviteError.new(INVITE_ERRORS[key], options)
  end

  def fail_now
    raise InvitesFailedError.new(errors: @errors)
  end

end