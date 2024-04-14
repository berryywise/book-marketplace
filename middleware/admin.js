function ensureAdmin(req, res, next) {

  if (req.user.isAdmin === true) {
    return next();
  }
  res.redirect("/404");
}

module.exports = ensureAdmin;
