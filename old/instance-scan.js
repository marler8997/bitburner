/** @param {NS} ns **/
// This script will attempt to execute itself on every server it can and report
// at the end which hosts suceeded/failed.

function arrayToKeys(map, arr) {
	for (var i = 0; i < arr.length; i++) {
		map[arr[i]] = true;
	}
}
function fatal(ns, host, msg) {
	ns.alert("instance-scan.js(" + host + ") error: " + msg);
	ns.exit();
}

export async function main(ns) {
	if (ns.args.length != 1) {
		ns.alert("instance-scan.js: error: expected 1 argument of JSON state, but got " + ns.args.length);
		return;
	}
	const state = JSON.parse(ns.args[0]);
	//ns.alert(state);
	//if (state.hops >= 10) { ns.alert("too many hops"); return; }

	const host = state.host; // passed in so we don't have to pay RamCost for ns.getHostname()
	const reply_host = (state.connect_path.length == 0) ? null : state.connect_path[state.connect_path.length-1];
	var log = state.log;

	const server_ignore_map = {};
	arrayToKeys(server_ignore_map, Object.keys(state.hosts));
	if (host in server_ignore_map)
		fatal(ns, host, "host '" + host + "' is in one the hosts_done list: " + state.hosts_done);
	arrayToKeys(server_ignore_map, state.connect_path);
	if (host in server_ignore_map)
		fatal(ns, host, "host '" + host + "' is in the connect_path: " + state.connect_path);

	const servers = ns.scan(); // RamCost: 0.2
	if (false) {
		ns.alert(host + " servers: " + servers);
	}

	// Just a sanity check to make sure the reply_host is in "servers"
	if (reply_host && !servers.includes(reply_host))
		fatal(ns, host, "reply_host '" + reply_host + "' is not in the server list: " + servers);

	const hosts = JSON.parse(JSON.stringify(state.hosts));
	const next_connect_path = state.connect_path.concat([host]);
	for (var i = 0; i < servers.length; i++) {
		const server = servers[i];
		if (server in server_ignore_map)
			continue;

		await ns.scp("instance-scan.js", host, server); // RamCost: 0.6

		// we need to killall on the server so we have enough Ram to run instance-scan.js
		ns.killall(server);

		const pid = await execScript(ns, server, {
			host: server,
			connect_path: next_connect_path,
			hosts: hosts,
			log: log,
			hops: state.hops + 1,
		}); // RamCost: 1.3
		if (pid != 0) return; // exit the program!

		hosts[server] = {scanned: false, connect_path: next_connect_path};
		log += server + ": exec instance-scan.js failed (path=" + next_connect_path + ")\n";
	}

	if (reply_host) {
		hosts[host] = {scanned: true, connect_path: state.connect_path};
		const pid = ns.exec("instance-scan.js", reply_host, 1, JSON.stringify({
			host: reply_host,
			connect_path: state.connect_path.slice(0, state.connect_path.length-1),
			hosts: hosts,
			log: log,
			hops: state.hops + 1,
		})); // we already pay RamCost for this
		if (pid == 0)
			fatal(ns, host, "unable to exec on reply_host from " + host + " to " + reply_host);
	} else {
		await ns.write("hosts.js", JSON.stringify(hosts, null, 2)); // .js instead of .json because .json not allowed
		ns.alert("scan.js: Success, wrote " + Object.keys(hosts).length + " hosts to hosts.js");
	}
}

async function execScript(ns, server, state) {
	// NOTE: can't do an attempt loop, results in huge RamCost for some reason?
	const state_json = JSON.stringify(state);
	const pid = ns.exec("instance-scan.js", server, 1, state_json);
	if (pid != 0)
		return pid;
	await ns.sleep(1);
	return ns.exec("instance-scan.js", server, 1, state_json);
}
