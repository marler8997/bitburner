/** @param {NS} ns **/

// we keep track hosts that we have already notified have no money
const global_target_state_map = {
    get: function get(host) {
        if (!(host in this)) {
            this[host] = { run_id: 0, notified_no_money_run_id: -1 };
        }
        return this[host];
    }
};

export async function main(ns) {
    if (ns.args.length != 1) {
        ns.alert("instance-smarthack.js: error: expected 1 cmd-line arg but got " + ns.args.length);
        return;
    }
    const config = JSON.parse(ns.args[0]);
    ns.print("my_hostname=" + config.my_hostname +
             ", target=" + config.target +
             ", min_money=" + config.min_money +
             ", security_threshold=" + config.security_threshold);

    const target_state = global_target_state_map.get(config.target);
    if ((config.my_hostname in target_state) && (target_state[config.my_hostname] == target_state.run_id)) {
        target_state.run_id += 1;
    }
    target_state[config.my_hostname] = target_state.run_id;

    while(true) {
        if (ns.getServerSecurityLevel(config.target) > config.security_threshold) {
            await ns.weaken(config.target);
            continue;
        }
        const money = ns.getServerMoneyAvailable(config.target);
        if (money == 0) {
            const my_run_id = target_state[config.my_hostname];
            if (my_run_id > target_state.notified_no_money_run_id) {
                ns.alert(config.my_hostname + ": " + config.target + " has no money! You'll need to restart the game to continue hacking it I think? (run_id=" + my_run_id + ")");
                target_state.notified_no_money_run_id = my_run_id;
            }
            return;
        } else {
            // TODO: check if we have notified there is no money and print an error like this?
            // ns.alert(config.my_hostname + ": target " + config.target + " had no money but not is has " + money + "???");
        }
        if (money < config.min_money) {
            await ns.grow(config.target);
        } else {
            await ns.hack(config.target);
        }
    }
}
