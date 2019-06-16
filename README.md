# Git-Switch
A utility to switch between different .gitconfig files.

> This utility is based on and borrows much of the underlying code from [NPMRC](https://github.com/deoxxa/npmrc), which does the same thing but for .npmrc files.

## Overview
If you've ever had to work in various environments with different proxy settings, or you have different github accounts for different projects, it can be a pain to constantly adjust your .gitconfig file manually. This utility allows you to maintain multiple named versions of your .gitconfig file and switch between them seamlessly with a simple terminal command. It also tries to protect you from yourself by making sure you don't accidentally overwrite a .gitconfig file that you actually want to keep.

## Installation

``` sh
npm install -g @joebochill/git-switch
```

## Usage

```
gitswitch --help

gitswitch

  A utility to switch between different .gitconfig files.

Usage:
  gitswitch                 list all profiles
  gitswitch [name]          change gitconfig profile (uses fuzzy matching)
  gitswitch -c [name]       create a new gitconfig profile called name
```

#### Initialisation

Calling `gitswitch` without arguments creates an `~/.gitconfigs/` directory if it doesn't exist,
and copies your current `~/.gitconfig` as the 'default' .gitconfig profile.

```
gitswitch
Creating /Users/joe/.gitconfigs
Making /Users/joe/.gitconfig the default gitconfig file
Activating .gitconfig 'default'
```

#### Create a new .gitconfig profile

```
gitswitch -c newprofile
Removing old .gitconfig (/home/joe/.gitconfigs/default)
Activating .gitconfig 'newprofile'
```

A blank profile will be created.

#### List available .gitconfig profiles

```
gitswitch 
Available gitconfigs:
    
* default
  work
```

#### Switch to a specific .gitconfig 

```
gitswitch work
Removing old .gitconfig (/Users/joe/.gitconfigs/default)
Activating .gitconfig 'work'
```

You can also pass only the first few characters of a profile and `gitswitch` will
autocomplete the profile's name.

```
gitswitch def
Removing old .gitconfig (/Users/joe/.gitconfigs/work)
Activating .gitconfig 'default'
```

`gitswitch <name>` will also go to some lengths to make sure you don't overwrite anything you might care about:

```
gitswitch default
Removing old .gitconfig (/Users/joe/.gitconfigs/work)
Activating .gitconfig 'default'
gitswitch default  
Current .gitconfig (/Users/joe/.gitconfig) is already 'default' (/Users/joe/.gitconfigs/default)
rm ~/.gitconfigs
touch ~/.gitconfigs
gitswitch default
Current .gitconfig (/Users/joe/.gitconfigs) is not a regular file, not removing it
rm ~/.gitconfigs
gitswitch default
Activating .gitconfig 'default'
```

> **Note For Windows Users:**
You may have to run gitswitch in a shell (cmd, PowerShell, Git Bash, etc) with elevated (Administrative) privileges to get it to run.

## Environment Variables
* `NPMRC_STORE` - Path to directory of profiles. Default: `~/.gitconfigs/`
* `NPMRC` - Path to the gitconfig file used by git. Default: `~/.gitconfig`

## License
MIT. A copy is included with the source.