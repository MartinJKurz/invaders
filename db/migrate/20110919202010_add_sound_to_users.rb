class AddSoundToUsers < ActiveRecord::Migration
  def change
    add_column :users, :sound, :boolean
  end
end
