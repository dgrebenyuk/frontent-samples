//= require 'angular-ui-router'
//= require 'angular-rails-templates'
//= require sugar.min
//= require inflection
//= require date
//= require ui-bootstrap-0.13.0.min
//= require ui-bootstrap-tpls-0.13.0.min
//= require angular-scrollable-table
//= require FileSaver

//= require_self
//= require_tree ../base

// Load appropriate Controllers
//= require ../controllers/week_methodology_ctrl


angular.module("FeedMG", ["ui.bootstrap", "ui.date", "ui.router", "templates"])
