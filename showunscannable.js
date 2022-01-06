/** @param {NS} ns **/
export async function main(ns) {
    const hosts_text = ns.read("hosts.js");
    if (hosts_text.length == 0) {
	ns.alert("showunscannable.js: hosts.js does not exist, have you run scan.js?");
	return;
    }
    const hosts = JSON.parse(hosts_text);
    if (typeof hosts != "object") {
	ns.alert("hosts.json did not have an 'object'? It has a: " + typeof hosts);
	return;
    }
    var report = '';
    for (const host in hosts) {
	const host_info = hosts[host];
	if (host_info.server_count > 0) continue;
	report += host + " (" + host_info.connect_path.join(", ") + ")\n";
    }
    if (report.length == 0) {
        ns.alert("all hosts have at least one server");
    } else {
	ns.alert(report);
    }
}
