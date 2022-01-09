export function scanHosts(ns, start_host) {
    const hosts = {};
    scanHost(ns, hosts, [], start_host);
    return hosts;
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
