/** @param {NS} ns **/
// This script will attempt to execute itself on every server it can and report
// at the end which hosts suceeded/failed.

function arrayToKeys(map, arr) {
	for (var i = 0; i < arr.length; i++) {
		map[arr[i]] = true;
	}
}
function joinSep(existing, next, sep) {
	if (existing.length == 0) return next;
	return existing + sep + next;
}
function fatal(ns, host, msg) {
	ns.alert("<<script_name>>(" + host + ") error: " + msg);
	ns.exit();
}

export async function main(ns) {
	if (ns.args.length != 1) {
		ns.alert("<<script_name>>: error: expected 1 argument of JSON state, but got " + ns.args.length);
		return;
	}
	const state = JSON.parse(ns.args[0]);
	//ns.alert(state);
	//if (state.hops >= 10) { ns.alert("too many hops"); return; }

	const host = state.host; // passed in so we don't have to pay RamCost for ns.getHostname()
	const reply_host = (state.connect_path.length == 0) ? null : state.connect_path[state.connect_path.length-1];
	var log = state.log;

	const server_ignore_map = {};
	arrayToKeys(server_ignore_map, state.hosts_done);
	if (host in server_ignore_map)
		fatal(ns, host, "host '" + host + "' is in one the hosts_done list: " + state.hosts_done);
	arrayToKeys(server_ignore_map, state.connect_path);
	if (host in server_ignore_map)
		fatal(ns, host, "host '" + host + "' is in the connect_path: " + state.connect_path);

	if (state.just_finished_crawl && (state.constant.post_exec.length > 0)) {
		if (!await copyAndExecScript(ns, state, state.just_finished_crawl, state.constant.post_exec)) {
			log += state.just_finished_crawl + ": exec " + state.constant.post_exec[0] + " failed\n";
		}
	}

	const servers = ns.scan(); // RamCost: 0.2
	if (false) {
		ns.alert(host + " servers: " + servers);
	}

	// Just a sanity check to make sure the reply_host is in "servers"
	if (reply_host && !servers.includes(reply_host))
		fatal(ns, host, "reply_host '" + reply_host + "' is not in the server list: " + servers);

	var hosts_done = state.hosts_done;
	const next_connect_path = state.connect_path.concat([host]);
	for (var i = 0; i < servers.length; i++) {
		const server = servers[i];
		if (server in server_ignore_map)
			continue;

		<<before_remote_exec>>

		if (state.constant.pre_exec.length > 0) {
			fatal(ns, host, "not imp pre_execl");
			if (!await copyAndExecScript(ns, host, server, pre_scripts)) {
				log += "failed to exec " + pre_scripts + " on " + server + " from " + host_path_arg + "\n";
			}
		}

		await ns.scp("<<script_name>>", host, server); // RamCost: 0.6
		const pid = await execScript(ns, server, {
			host: server,
			connect_path: next_connect_path,
			just_finished_crawl: null,
			hosts_done: hosts_done,
			log: log,
			hops: state.hops + 1,
			constant: state.constant,
		}); // RamCost: 1.3
		if (pid != 0) return; // exit the program!

		hosts_done = hosts_done.concat([server]);
		log += server + ": exec <<script_name>> failed (path=" + next_connect_path + ")\n";
		// we can still try to execute the post script on it
		if (state.constant.post_exec.length > 0) {
			if (!await copyAndExecScript(ns, state, server, state.constant.post_exec)) {
				log += server + ": exec " + state.constant.post_exec[0] + " failed\n";
			}
		}
	}

	if (reply_host) {
		const pid = ns.exec("<<script_name>>", reply_host, 1, JSON.stringify({
			host: reply_host,
			connect_path: state.connect_path.slice(0, state.connect_path.length-1),
			just_finished_crawl: host,
			hosts_done: hosts_done.concat([host]),
			log: log,
			hops: state.hops + 1,
			constant: state.constant,
		})); // we already pay RamCost for this
		if (pid == 0) {
			fatal(ns, host, "unable to exec on reply_host from " + host + " to " + reply_host);
		}
	} else {
		var report = "Attempted to execute on " + hosts_done.length + " hosts:\n";
		report += "--------------------------------------------------------------------------------\n";
		report += hostsToText(hosts_done, 6);
		report += "\n--------------------------------------------------------------------------------\n";
		report += log;
		ns.alert(report);
		if (state.constant.done_file)
			await ns.write("crawldone.txt", "done", "w"); // create a way for the caller to tell when we're done
	}
}

async function execScript(ns, server, state) {
	// NOTE: can't do an attempt loop, results in huge RamCost for some reason?
	const state_json = JSON.stringify(state);
	const pid = ns.exec("<<script_name>>", server, 1, state_json);
	if (pid != 0)
		return pid;
	await ns.sleep(1);
	return ns.exec("<<script_name>>", server, 1, state_json);
}

async function copyAndExecScript(ns, state, server, exec_args) {
	for (var i = 0; i < state.constant.files_to_copy.length; i++) {
		await ns.scp(state.constant.files_to_copy[i], state.host, server); // RamCost: 0.6
	}
	await ns.scp(exec_args[0], state.host, server); // RamCost: 0.6

	// start it with the maximum amount of threads
	// NOTE: should make this a cmd option
	for (var thread_count = 100; thread_count != 0; thread_count -= 1) {
		const pid = ns.exec(exec_args[0], server, thread_count, ...exec_args.slice(1));
		if (pid != 0)
			return true; // success
	}
	return false; // fail
}

function hostsToText(hosts, per_line) {
	var text = '';
	for(var i = 0; i < hosts.length; i++) {
		if (i == 0)
			{ }
		else if ((i % per_line) == 0)
			text += "\n";
		else
			text += " ";
		text += hosts[i];
	}
	return text;
}
