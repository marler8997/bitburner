/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length == 0) {
        ns.alert("Usage: buyservers.js RAM");
        return;
    }
    const ram = parseInt(ns.args[0]);
    const server_limit = ns.getPurchasedServerLimit();
    const start_server_id = findNextServerId(ns);
    var i = 0;
    while (i < server_limit) {
	const host = ns.purchaseServer("myserver" + (start_server_id + i), ram);
	if (host.length == 0)
	    break;
	i++;
    }
    ns.alert("bought " + i + " " + ram + " GB server(s) from " + start_server_id + " to " + (start_server_id+i));
}
function findNextServerId(ns) {
    const servers = ns.getPurchasedServers();
    var max = 0;
    for (var i = 0; i < servers.length; i++) {
	const server = servers[i];
	if (server.startsWith("myserver")) {
	    const num = parseInt(server.substring(8)) + 1;
	    max = (max > num) ? max : num;
	}
    }
    return max;
}
