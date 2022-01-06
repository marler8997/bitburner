/** @param {NS} ns **/
// examples:
//     run for.js remote hack.js
//     run for.js local killall.js $host
//
// TODO: it might make sense to split up the remote/local code, they might
//       not share much in common, so long as I can put the scan stuff in a library
export async function main(ns) {
    if (ns.args.length < 2) {
        ns.alert(
            "Usage: run for.js local|remote SCRIPT ARGS...\n" +
                "       use $host to insert the host as a script argument\n"
        );
        return;
    }
    const kind = ns.args[0];
    var is_remote = false;
    if (kind == "local" || kind == "l") {
        is_remote = false;
    } else if (kind == "remote" || kind == "r") {
        is_remote = true;
    } else {
        ns.alert("for.js: error: expected 1st arg to be 'local' or 'remote' but got '" + kind + "'");
        return;
    }
    const exec_args = ns.args.slice(1);
    var host_arg_index = null;
    for (var i = 1; i < exec_args.length; i++) {
        if (exec_args[i] == "$host") {
            host_arg_index = i;
            break;
        }
    }

    const hosts_text = ns.read("hosts.js");
    if (hosts_text.length == 0) {
        ns.alert("for.js: hosts.js does not exist, have you run scan.js?");
        return;
    }
    const hosts = JSON.parse(hosts_text);
    if (typeof hosts != "object") {
        ns.alert("hosts.json did not have an 'object'? It has a: " + typeof hosts);
        return;
    }
    // TODO: I could get me from hosts.js with the host that has the empty connect_path
    const me = ns.getHostname();
    const state = {
        log: '',
        success_count: 0,
        fail_count: 0,
    };

    // A way to handle each host ordered by how close they are.
    //        for (var depth = 1; ; depth++) {
    //                var match_count = 0;
    //                for (const host in hosts) {
    //                        const host_obj = hosts[host];
    //                        if (host_obj.connect_path.length == depth) {
    //                                match_count++;
    //                                await handleHost(ns, is_remote, exec_args, host_arg_index, me, host, state);
    //                        }
    //                }
    //                if (match_count == 0)
    //                        break;
    //        }
    for (const host in hosts) {
        const host_info = hosts[host];
        if (host_info.connect_path.length == 0)
            continue; // ignore current host (maybe make this a command-line option)
        await handleHost(ns, is_remote, exec_args, host_arg_index, me, host, state);
    }

    ns.alert(
        "success=" + state.success_count + ", fail=" + state.fail_count + "\n" +
            "----------------------------------------\n" +
            state.log
    );
}

async function handleHost(ns, is_remote, exec_args, host_arg_index, me, host, state) {
    if (!await ns.scp(exec_args[0], me, host)) { // RamCost: 0.6
        state.fail_count += 1;
        state.log += host + ": FAIL (scp)\n";
        return;
    }
    if (host_arg_index) {
        exec_args[host_arg_index] = host;
    }
    if (is_remote) {
        const thread_count = execScript(ns, exec_args, host);
        if (thread_count > 0) {
            state.success_count += 1;
            state.log += host + ": SUCCESS (" + thread_count + ")\n";
        } else {
            state.fail_count += 1;
            state.log += host + ": FAIL (exec)\n";
        }
    } else {
        const result = await execLocal(ns, exec_args);
        if (result[0] != 0) {
            state.success_count += 1;
            state.log += host + ": SUCCESS (pid=" + result[0] + ", attempts=" + result[1] + ")\n";
        } else {
            state.fail_count += 1;
            state.log += host + ": FAIL (run)\n";
        }
    }
}

async function execLocal(ns, exec_args) {
    for (var count = 1; count < 100; count++) {
        const pid = ns.run(exec_args[0], 1, ...exec_args.slice(1));
        if (pid != 0)
            return [pid, count];
        await ns.sleep(20);
    }
    return [0, 0];
}

function execScript(ns, exec_args, host) {
    const script_args = exec_args.slice(1);
    const ram_pair = ns.getServerRam(host);
    const ram_total = ram_pair[0];
    const MIN_SCRIPT_RAM = 1.6;
    for (var thread_count = Math.floor(ram_total / MIN_SCRIPT_RAM); thread_count != 0; thread_count -= 1) {
        const pid = ns.exec(exec_args[0], host, thread_count, ...script_args);
        if (pid != 0) {
            return thread_count;
        }
    }
    return 0;
}
