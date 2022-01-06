/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length == 0) {
        ns.alert("Usage: maxhome.js SCRIPT ARGS...");
        return;
    }
    const script = ns.args[0];
    // TODO: support an option to leave some RAM, like --leave 5
    const script_ram = ns.getScriptRam(script);
    const server_ram_pair = ns.getServerRam(ns.getHostname());
    const server_ram_available = server_ram_pair[0] - server_ram_pair[1];
    const thread_count = Math.floor(server_ram_available / script_ram);
    const pid = ns.run(script, thread_count, ...ns.args.slice(1));
    if (pid == 0) {
        ns.alert("maxhome.js: failed to start '" + script + "' with " + thread_count + " threads\n" +
                 "script_ram=" + script_ram + ", server_ram_available=" + server_ram_available);
        return;
    }
    ns.alert("maxhome.js: started '" + script + "' with " + thread_count + " threads");
}
