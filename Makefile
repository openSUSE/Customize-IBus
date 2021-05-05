# Maintainer: Hollow Man <hollowman at hollowman dot ml>
# Contributor: Hollow Man <hollowman at hollowman dot ml>

rpm:
	createrepo_c --deltas --retain-old-md 1 ./rpm
