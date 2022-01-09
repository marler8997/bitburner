/** @param {NS} ns **/
// smarthack.js [TARGET_HOST] [MIN_MONEY_TO_HACK]
// This script gathers all information needed for each instance of this script.
// The reason for this is because gathering information takes Ram and we want
// the actual instance to use as little Ram as possible.

import { scanHosts } from "libscan.js";
import { execMaxThreads } from "libmaxthreads.js";

export async function main(ns) {
    const me = ns.getHostname();
    const hosts = scanHosts(ns, me);

    var target = "joesguns";
    if (ns.args.length >= 1) target = ns.args[0];
    
    var min_money = 0;
    if (ns.args.length >= 2) {
        min_money = parseMoney(ns.args[1]);
    } else {
        const max_money = ns.getServerMaxMoney(target);
        if (max_money == 0) {
            ns.alert("target '" + target + "' has 0 max money");
            return;
        }
        min_money = max_money * 0.8;
    }

    var state = { log: '', fail_count: 0, success_count: 0, total_threads: 0 };
    for (const host in hosts) {
        const config = JSON.stringify({
            my_hostname: host,
            target: target,
            min_money: min_money,
            security_threshold: 10,
        });
        if (host == me) {
            const ram_pair = ns.getServerRam(me);
            const ram = ram_pair[0] - 10;
            if (ram > 0) {
                const needed_ram = ns.getScriptRam("instance-smarthack.js", me);
                const thread_count = Math.floor(ram / needed_ram);
                if (thread_count > 0) {
                    const pid = ns.run("instance-smarthack.js", thread_count, config);
                    if (pid == 0) {
                        state.fail_count += 1;
                        state.log += me + ": FAIL (exec)\n";
                    } else {
                        state.success_count += 1;
                        state.log += me + ": Success (" + thread_count + " threads)\n";
                    }
                }
            }
            continue;
        }
        if (!await ns.scp("instance-smarthack.js", me, host)) {
            state.fail_count += 1;
            state.log += host + ": FAIL (scp)\n";
            return;
        }
        const thread_count = execMaxThreads(ns, "instance-smarthack.js", host, config);
        state.total_threads += thread_count;
        if (thread_count == 0) {
            state.fail_count += 1;
            state.log += host + ": FAIL (exec)\n";
        } else {
            state.success_count += 1;
            state.log += host + ": Success (" + thread_count + " threads)\n";
        }
    }
    ns.alert("smarthack.js: target=" + target + " min_money=" + min_money + "\n" +
             "started " + state.total_threads + " threads on " + state.success_count + " hosts (" + state.fail_count + " failed)\n" +
             state.log);
}

function parseMoney(str) {
    if (str.endsWith("K")) return parseInt(str) * 1000;
    if (str.endsWith("M")) return parseInt(str) * 1000000;
    if (str.endsWith("B")) return parseInt(str) * 1000000000;
    return parseInt(str);
}
