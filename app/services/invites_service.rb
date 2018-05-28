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
    map_rows = []
    old_row = 0
    hash_array = XlsxService.new.xlsx_to_hash_array(file).select do |invite_params|
      if invite_params.present?
        map_rows += [old_row]
      end
      old_row += 1
      invite_params.present?
    end
    after_xlsx_to_hash_array hash_array
    invites = build_invites(hash_array, default_params, inviter)
    pre_check_invites(invites)
    if @errors.empty?
      save_invites(invites)
    else
      fail_now
    end
  rescue InvitesFailedError => e
    e.errors.each do |e|
      e.row && (e.row = (map_rows[e.row]+2))
      e.rows&.map!{|r| map_rows[r]+2}
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

  def generate_example_xlsx
    XlsxService.new.hash_array_to_xlsx [
      {
        email: 'someuser@somedomain.com',
        first_name: 'John',
        last_name: 'Johnson',
        language: Tenant.settings('core', 'locales').first,
        groups: MultilocService.new.t(Group.first&.title_multiloc),
        admin: false,
      }
    ]
  end

  private

  def after_xlsx_to_hash_array hash_array
    hash_array.each.with_index do |hash, row_index|
      if hash['groups']
        hash['group_ids'] = xlsx_groups_to_group_ids(hash['groups'], row_index)
      end
      hash.delete('groups')

      if hash['admin'].present?
        hash['roles'] = xlsx_admin_to_roles(hash['admin'], row_index)
      end
      hash.delete('admin')

      if hash['language'].present?
        hash['locale'] = hash['language']
      end
      hash.delete('language')

    end
  rescue Exception => e
    add_error(:unparseable_excel, raw_error: e.to_s)
    fail_now
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
      add_error(:max_invites_limit_exceeded, row: (hash_array.size-1), value: MAX_INVITES)
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
        SideFxUserService.new.before_create(invite.invitee, invite.inviter)
        invite.invitee.save
        invite.save
      end
    end
    invites.each do |invite|
      SideFxUserService.new.after_create(invite.invitee, invite.inviter)
      SideFxInviteService.new.after_create(invite, invite.inviter)
    end
  end

  def add_error key, options={}
    @errors << InviteError.new(INVITE_ERRORS[key], options)
  end

  def fail_now
    raise InvitesFailedError.new(errors: @errors)
  end

end