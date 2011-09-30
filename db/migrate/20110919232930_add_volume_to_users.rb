class AddVolumeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :volume, :float, :default => 1.0
  end
end
