# frozen_string_literal: true

require 'rubyXL'

class InvitesService
  MAX_INVITES = 1000

  delegate :add_error, :fail_now, to: :@error_storage

  def initialize
    @error_storage = Invites::ErrorStorage.new
  end

  def generate_token
    [*('a'..'z'), *('0'..'9')].sample(9).join
  end

  def bulk_create_xlsx(xlsx_param, default_params = {}, inviter = nil)
    hash_array, map_rows = Invites::XlsxProcessor.new(@error_storage).param_to_hash_array(xlsx_param)

    bulk_create(hash_array, default_params, inviter)
  rescue Invites::FailedError => e
    e.errors.each do |error|
      error.row && (error.row = (map_rows[error.row] + 2))
      error.rows&.map! { |r| map_rows[r] + 2 }
    end
    raise e
  end

  def bulk_create(hash_array, default_params = {}, inviter = nil)
    invites = build_invites(hash_array, default_params, inviter)
    check_invites(invites)
    if @error_storage.no_critical_errors?
      save_invites(invites - ignored_invites(invites))
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
    @custom_field_schema ||= CustomFieldService.new.fields_to_json_schema(CustomField.with_resource_type('User'))
  end

  # @return [Array<String>]
  def custom_field_keys
    custom_field_schema[:properties].keys
  end

  def build_invites(hash_array, default_params = {}, inviter = nil)
    if hash_array.size > MAX_INVITES
      add_error(:max_invites_limit_exceeded, row: (hash_array.size - 1), value: MAX_INVITES)
      fail_now
    elsif hash_array.empty?
      add_error(:no_invites_specified)
      fail_now
    else
      invites = hash_array.map do |invite_params|
        build_invite(invite_params, default_params, inviter)
      end

      invitees = invites.map(&:invitee)
      UserSlugService.new.generate_slugs(invitees)
      invites
    end
  end

  def build_invite(params, default_params = {}, inviter = nil)
    invitee = User.new({
      email: params['email']&.strip,
      first_name: params['first_name'],
      last_name: params['last_name'],
      locale: params['locale'] || default_params['locale'] || AppConfiguration.instance.settings('core', 'locales').first,
      manual_group_ids: params['group_ids'] || default_params['group_ids'] || [],
      roles: params['roles'] || default_params['roles'] || [],
      custom_field_values: params.slice(*custom_field_keys),
      invite_status: 'pending'
    })

    Invite.new(
      invitee: invitee,
      inviter: inviter,
      invite_text: params['invite_text'] || default_params['invite_text'],
      send_invite_email: params['send_invite_email'].nil? ? true : params['send_invite_email']
    )
  end

  def check_invites(invites)
    check_duplicate_emails(invites)

    invites.each_with_index do |invite, row_nb|
      @current_row = row_nb
      validate_invite(invite)
    end
  ensure
    @current_row = nil
  end

  def check_duplicate_emails(invites)
    emails_indexes = invites.each_with_object(Hash.new { [] }).with_index do |(invite, object), index|
      object[invite.invitee.email] += [index]
    end
    duplicated_emails_indexes = emails_indexes.select { |email, row_indexes| email && row_indexes.size > 1 }
    duplicated_emails_indexes.each do |email, row_indexes|
      add_error(:emails_duplicate, rows: row_indexes, value: email)
    end
  end

  def validate_invite(invite)
    invite.invitee.validate!
    invite.validate!
  rescue ActiveRecord::RecordInvalid => e
    e.record.errors.details.each do |field, error_descriptors|
      error_descriptors.each do |error_descriptor|
        if field == :locale
          add_error(:unknown_locale, row: @current_row, value: error_descriptor[:value], raw_error: e)
        elsif field == :email && error_descriptor[:error] == :invalid
          add_error(:invalid_email, row: @current_row, value: error_descriptor[:value], raw_error: e)
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

  def save_invites(invites)
    ActiveRecord::Base.transaction do
      invites.each do |invite|
        SideFxUserService.new.before_create(invite.invitee, invite.inviter)
        invite.invitee.save!
        invite.save!
      end
    end
    invites.each do |invite|
      SideFxUserService.new.after_create(invite.invitee, invite.inviter)
      SideFxInviteService.new.after_create(invite, invite.inviter)
    end
  end

  def ignored_invites(invites)
    @error_storage.ignored_errors.map { |e| invites[e.row] }
  end
end
