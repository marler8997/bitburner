/** @param {NS} ns **/
export async function main(ns) {
    const hosts = {};
    const servers = ns.scan(); // RamCost: 0.2
    scanHost(ns, hosts, [], ns.getHostname());

    var report = '';
    for (const host in hosts) {
        const info = hosts[host];
        report += host + ": " + info.server_count + " servers";
        if (info.connect_path.length > 0)
            report += " (" + info.connect_path.join(",") + ")";
        report += "\n";
    }
    ns.rm("hosts.js");
    await ns.write("hosts.js", JSON.stringify(hosts, null, 2)); // .js instead of .json because .json not allowed
    ns.alert("scanned " + Object.keys(hosts).length + " hosts, wrote to hosts.js");
}

function scanHost(ns, hosts, connect_path, host) {
    if (host in hosts) return;

    const servers = ns.scan(host);
    const info = { server_count: servers.length, connect_path: connect_path };
    hosts[host] = info;

    const next_connect_path = connect_path.concat([host]);
    for (var i = 0; i < servers.length; i++) {
        scanHost(ns, hosts, next_connect_path, servers[i]);
    }
}
