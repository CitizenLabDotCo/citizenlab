# frozen_string_literal: true

require 'pry-byebug'

Pry.config.history_file = Rails.root.join('tmp/.pry_history')

if defined?(PryByebug)
  Pry.commands.alias_command 'c', 'continue'
  Pry.commands.alias_command 's', 'step'
  Pry.commands.alias_command 'n', 'next'
  Pry.commands.alias_command 'f', 'finish'
  Pry.commands.alias_command 'bt', 'backtrace'
  Pry::Commands.command(/^$/, 'repeat last command') do
    pry_instance.input = StringIO.new(Pry.history.to_a.last)
  end
end
