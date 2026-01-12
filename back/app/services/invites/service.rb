# frozen_string_literal: true

require 'rubyXL'

class Invites::Service
  MAX_INVITES = 1_000

  delegate :add_error, :fail_now, to: :@error_storage

  def initialize(inviter = nil, run_side_fx: true)
    @inviter = inviter
    @run_side_fx = run_side_fx
    @error_storage = Invites::ErrorStorage.new
  end

  def generate_token
    [*('a'..'z'), *('0'..'9')].sample(9).join
  end

  def bulk_create_xlsx(xlsx_param, default_params = {})
    xlsx_processor = Invites::XlsxProcessor.new(@error_storage, custom_field_schema)
    hash_array, map_rows = xlsx_processor.param_to_hash_array(xlsx_param)

    bulk_create(hash_array, default_params)
  rescue Invites::FailedError => e
    e.errors.each do |error|
      error.row && (error.row = (map_rows[error.row] + 2))
      error.rows&.map! { |r| map_rows[r] + 2 }
    end
    raise e
  end

  def bulk_create(hash_array, default_params = {})
    invitees = build_invitees(hash_array, default_params)
    check_invitees(invitees)
    if @error_storage.no_critical_errors?
      save_invitees(invitees - ignored_invitees(invitees))
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
        language: AppConfiguration.instance.settings('core', 'locales').first,
        groups: MultilocService.new.t(Group.first&.title_multiloc),
        admin: false
      }
    ]
  end

  private

  def custom_field_schema
    @custom_field_schema ||= CustomFieldService.new.fields_to_json_schema(CustomField.registration)
  end

  # @return [Array<String>]
  def custom_field_keys
    custom_field_schema[:properties].keys
  end

  def build_invitees(hash_array, default_params = {})
    if hash_array.size > MAX_INVITES
      add_error(:max_invites_limit_exceeded, row: (hash_array.size - 1), value: MAX_INVITES)
      fail_now
    elsif hash_array.empty?
      add_error(:no_invites_specified)
      fail_now
    else
      invitees = hash_array.map do |invite_params|
        build_invitee(invite_params, default_params)
      end

      UserSlugService.new.generate_slugs(invitees)
      invitees
    end
  end

  def build_invitee(params, default_params = {})
    invitee = prepare_invitee(params, default_params)

    if invitee.new_record?
      invitee.invitee_invite = Invite.new(
        invitee: invitee,
        inviter: @inviter,
        invite_text: params['invite_text'] || default_params['invite_text'],
        send_invite_email: params['send_invite_email'].nil? ? true : params['send_invite_email']
      )
    end

    invitee
  end

  def prepare_invitee(params, default_params)
    email = params['email']&.strip
    group_ids = params['group_ids'] || default_params['group_ids'] || []
    roles = ((params['roles'] || []) + (default_params['roles'] || [])).uniq

    user =
      User.find_by_cimail(email) ||
      User.new({
        email: email,
        first_name: params['first_name'],
        last_name: params['last_name'],
        locale: params['locale'] || default_params['locale'] || AppConfiguration.instance.settings('core', 'locales').first,
        custom_field_values: params.slice(*custom_field_keys),
        invite_status: 'pending'
      })

    user.manual_group_ids = (user.manual_group_ids + group_ids).uniq
    user.roles = (user.roles + roles).map(&:to_h).uniq
    user
  end

  def check_invitees(invitees)
    check_duplicate_emails(invitees)

    invitees.each_with_index do |invitee, row_nb|
      @current_row = row_nb
      validate_invitee(invitee)
    end
  ensure
    @current_row = nil
  end

  def check_duplicate_emails(invitees)
    emails_indexes = invitees.each_with_object(Hash.new { [] }).with_index do |(invitee, object), index|
      object[invitee.email] += [index]
    end
    duplicated_emails_indexes = emails_indexes.select { |email, row_indexes| email && row_indexes.size > 1 }
    duplicated_emails_indexes.each do |email, row_indexes|
      add_error(:emails_duplicate, rows: row_indexes, value: email)
    end
  end

  def validate_invitee(invitee)
    invitee.validate!
    invitee.invitee_invite&.validate!
  rescue ActiveRecord::RecordInvalid => e
    e.record.errors.details.each do |field, error_descriptors|
      error_descriptors.each do |error_descriptor|
        if field == :locale
          add_error(:unknown_locale, row: @current_row, value: error_descriptor[:value], raw_error: e)
        elsif field == :email && error_descriptor[:error] == :invalid
          add_error(:invalid_email, row: @current_row, value: error_descriptor[:value], raw_error: e)
        elsif field == :email && error_descriptor[:code] == 'zrb-43'
          add_error(:email_banned, row: @current_row, value: error_descriptor[:value], raw_error: e)
        # :taken and :taken_by_invite should not happen after 662da0dc85
        # ToDo: remove these two elsif branches and the `ignore` option of `add_error`.
        elsif field == :email && error_descriptor[:error] == :taken
          add_error(:email_already_active, row: @current_row, value: error_descriptor[:value], raw_error: e, ignore: true)
        elsif field == :email && error_descriptor[:error] == :taken_by_invite
          add_error(:email_already_invited, row: @current_row, value: error_descriptor[:value], raw_error: e, ignore: true)
        else
          add_error(:invalid_row, row: @current_row, value: field, raw_error: e)
        end
      end
    end
  end

  def save_invitees(invitees)
    ActiveRecord::Base.transaction do
      invitees.each(&:save!)
    end

    invitees.each do |invitee|
      if @run_side_fx
        if invitee.previously_new_record?
          SideFxUserService.new.after_create(invitee, @inviter)
          SideFxInviteService.new.after_create(invitee.invitee_invite, @inviter)
        else
          SideFxUserService.new.after_update(invitee, @inviter)
        end
      end
    end

    invitees
  end

  def ignored_invitees(invitees)
    @error_storage.ignored_errors.map { |e| invitees[e.row] }
  end
end
