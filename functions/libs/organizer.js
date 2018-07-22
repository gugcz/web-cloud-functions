exports.formatOrganizerItem = function (org) {
  return {
    name: org.name,
    profilePicture: org.profilePicture || '',
    links: org.links || []
  }
}
