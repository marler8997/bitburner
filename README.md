
# Start Commands
```
# Generate initial hosts.js file for for.js
run scan.js

# nuke as many hosts as possible
run for.js local nuke5.js $host

# start hacking
run smarthack.js
# old one: run for.js remote hack.js

# kill all scripts
run for.js local killall.js $host
```

# Common Commands

```
run showunscannable.js
run analyze-hosts-for-hack.js

# run a script on "home" with max threads
run maxthreads.js SCRIPT ARGS...
```

## Commands for buying/selling servers

```
# show a table of how much it costs to buy servers
run calcservercost.js

# delete all the servers (to buy new ones)
run deleteservers.js

run buyservesr.js RAM
```

## Commands to remember

```
# hack 100
run for.js remote hack.js phantasy 520M
# hack 404
run for.js remote hack.js netlink 6B
# hack 57, up to 395B
run for
# hack 99, up to 1654B
```

# Reminders

* get darkweb by buying TOR router from Alpha Ent (make script for this)
    - use to purchase crack executables (from 1M to 250M)

# TODO

* script to show a hosts connect path
* backdoor script?
