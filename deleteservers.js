/** @param {NS} ns **/
export async function main(ns) {
    const servers = ns.getPurchasedServers();
    var success = 0;
    var failed = 0;
    var log = '';
    for (var i = 0; i < servers.length; i++) {
        const server = servers[i];
        ns.killall(server);
        if (ns.deleteServer(server)) {
            success += 1;
            log += "deleted: " + server + "\n";
        } else {
            failed += 1;
            log += "FAILED : " + server + "\n";
        }
    }
    ns.alert("Deleted " + success + ", Failed to delete " + failed + "\n" + log);
}
