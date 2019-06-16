#!/usr/bin/env node

const path = require('path')
    , fs   = require('fs')
    , os = require('os');


const GITSWITCH_STORE = process.env.GITSWITCH_STORE || path.join(process.env.HOME || process.env.USERPROFILE, '.gitconfigs')
    , GITSWITCH       = process.env.GITSWITCH || path.join(process.env.HOME || process.env.USERPROFILE, '.gitconfig')
    , registries    = {
        au: 'http://registry.npmjs.org.au/'
      , eu: 'http://registry.npmjs.eu/'
      , cn: 'http://r.cnpmjs.org/'
      , defaultReg: 'https://registry.npmjs.org/'
    }
    , USAGE       = 'Usage:\n'
                  + '  gitswitch                 list all profiles\n'
                  + '  gitswitch [name]          change gitconfig profile (uses fuzzy matching)\n'
                  + '  gitswitch -c [name]       create a new gitconfig profile called name\n'

var opts
  , name

function printUsage () {
  console.error(USAGE)
  process.exit(1)
}


function printHelp () {
  process.stdout.write(
      'gitswitch\n'
    + '\n'
    + '  Easily witch between different .gitconfig files.\n\n'
    + USAGE
    + '\n'
    + 'Example:\n\n'
    + '  # Creating and activating a new .gitconfig called "work":\n'
    + '  $ gitswitch -c work\n\n'
    + '  # Switch betwen "work" and "default"\n'
    + '  $ gitswitch work\n'
    + '  $ gitswitch default\n'
  )
  process.exit(1)
}


function printNpmrcs () {
  console.log('Available gitconfigs:\n')
  fs.readlink(GITSWITCH, function (err, link) {
    link = link && path.basename(link)
    fs.readdirSync(GITSWITCH_STORE).forEach(function (gitconfig) {
      if (gitconfig[0] !== '.') {
        console.log(' %s %s', link == gitconfig ? '*' : ' ', gitconfig)
      }
    })
  })
}


// safety check so we don't go overwriting accidentally
function checkSymlink (stat) {
  if (!stat.isSymbolicLink()) {
    console.log('Current .gitconfig (%s) is not a symlink. You may want to copy it into %s.', GITSWITCH, GITSWITCH_STORE)
    process.exit(1)
  }
}

// make the symlink
function link (name) {
  var ln = path.join(GITSWITCH_STORE, name || '')
    , stat

  if (ln == GITSWITCH_STORE || !fs.existsSync(ln)) {
    console.error('Couldn\'t find gitconfig file "%s".', name)
    return process.exit(1)
  }

  try {
    stat = fs.lstatSync(GITSWITCH)
    checkSymlink(stat)
  } catch (e) {}

  if (stat) {
    console.log('Removing old .gitconfig (%s)', path.basename(fs.readlinkSync(GITSWITCH)))
    fs.unlinkSync(GITSWITCH)
  }

  console.log('Activating .gitconfig "%s"', path.basename(ln))
  fs.symlinkSync(ln, GITSWITCH, 'file')
}

// partial match gitconfig names
function partialMatch(match, files) {
  files.sort() // own the sort order

  // try exact match
  var exactMatch = files.filter(function(file) {
    return file === match
  }).shift()
  if (exactMatch) return exactMatch

  // try starts with match
  var matchesStart = files.filter(function(file) {
    return file.indexOf(match) === 0
  }).shift()
  if (matchesStart) return matchesStart

  // try whatever match
  var matchesAnything = files.filter(function(file) {
    return file.match(new RegExp(match))
  }).shift()
  if (matchesAnything) return matchesAnything
}

// simplistic cmdline parser, sets "name" as the first non-'-' arg
// and sets "opts" as '-'-stripped characters (first char only)
;(function processCmdline () {
  opts = process.argv.slice(2).map(function (a) {
    return a[0] == '-' && a.replace(/^-+/, '')[0]
  }).filter(Boolean)

  name = process.argv.slice(2).filter(function (a) {
    return a[0] != '-'
  })[0] // first non '-' arg

  opts.filter(function (o) {
    if (o == 'c' || o == 'h') // other known opts go here
      return false

    console.error('Unknown option: -' + o)
    return true
  }).length && printUsage()

  if (opts.indexOf('h') > -1)
    printHelp()
}())


// set up .gitconfigs if it doesn't exist
;(function makeStore () {
  function make () {
    var def = path.join(GITSWITCH_STORE, 'default')

    console.log('Initialising gitswitch...')
    console.log('Creating %s', GITSWITCH_STORE)

    fs.mkdirSync(GITSWITCH_STORE)

    if (fs.existsSync(GITSWITCH)) {
      console.log('Making %s the default gitconfig file', GITSWITCH)
      fs.renameSync(GITSWITCH, def)
    } else {
      fs.writeFileSync(def, '')
    }

    link('default')
    process.exit(0)
  }

  try {
    var stat = fs.statSync(GITSWITCH_STORE)
    if (!stat.isDirectory()) {
      console.error('Error: %s is not a directory', GITSWITCH_STORE)
      process.exit(1)
    }
  } catch (e) {
    make()
  }
}())


// no name and no args
if (!name && !opts.length)
  return printNpmrcs()


;(function handleOPtions() {
  if (~opts.indexOf('c'))
    createNew()
}())

// handle -c <name>
function createNew () {
  if (!name) {
    console.error('What do you want to call your new gitconfig profile?')
    return printUsage()
  }

  var c = path.join(GITSWITCH_STORE, name)
  if (fs.existsSync(c)) {
    console.log('gitconfig file "%s", already exists (%s/%s)', name, GITSWITCH_STORE, name)
    return process.exit(1)
  }

  fs.writeFileSync(c, '')
}


if (name) name = partialMatch(name, fs.readdirSync(GITSWITCH_STORE)) || name

// sanity/safety check, also check if they want to switch
// to the already active one
;(function checkExisting () {
  var stat
  try {
    stat = fs.lstatSync(GITSWITCH)
    checkSymlink(stat)
  } catch (e) {
    // ignore
  }

  if (name && stat && fs.readlinkSync(GITSWITCH) == path.join(GITSWITCH_STORE, name)) {
    console.log('Current .gitconfig (%s) is already "%s" (%s/%s)', GITSWITCH, name, GITSWITCH_STORE, name)
    return process.exit(0)
  }
}())

// if we got here, then we're ready to switch
link(name)
