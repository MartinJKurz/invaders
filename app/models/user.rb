# == Schema Information
#
# Table name: users
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class User < ActiveRecord::Base
  attr_accessible :name

  validates :name,  :presence   => true,
                    :length     => { :maximum => 20 },
                    :uniqueness => { :case_sensitive => false }

end
