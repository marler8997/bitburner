// NOTE: this function is designed to have minimal game RamCost by being a
//       little inneficient.  Instead of calculating the exact amount of threads,
//       we calculate the maximum amount of threads and then just keeping calling
//       ns.exec until it works.  We could save even more Ram by not even calculating
//       the maximum amount threads and just starting with a very high number, but
//       that seems to innefficient since we would need to be starting at:
//       max_ram (1,048,576) / min_ram (1.6) = max_threads (655,360)
export function execMaxThreads(ns, script, host, ...args) {
    const ram_pair = ns.getServerRam(host);
    const ram_total = ram_pair[0];
    const MIN_SCRIPT_RAM = 1.6;
    for (var thread_count = Math.floor(ram_total / MIN_SCRIPT_RAM); thread_count != 0; thread_count -= 1) {
        const pid = ns.exec(script, host, thread_count, ...args);
        if (pid != 0)
            return thread_count;
    }
    return 0;
}
