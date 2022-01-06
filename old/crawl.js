/** @param {NS} ns **/
export async function main(ns) {
	// TODO: parse command-line args
	// TODO: accept --kill or -k to enable killall before propagating
	var kill_option = false;
	var post_exec = [];
	var done_file = false;
	// TODO: implement pre_exec maybe
	// TODO: implement files_to_copy maybe
	for (var i = 0; i < ns.args.length; i++) {
		const arg = ns.args[i];
		if (arg == "--kill" || arg == "-k") {
			kill_option = true;
		} else if (arg == "--done-file") {
			done_file = true;
		} else if (arg == "--post") {
			post_exec = ns.args.slice(i + 1);
			break;
		} else {
			ns.alert("unknown command-line argument: '" + arg + "'");
			return;
		}
	}

	const source = ns.read("template-crawl.js");
	ns.rm("instance-crawl.js");

	await ns.write("instance-crawl.js", source
		.replace(/<<script_name>>/g, "instance-crawl.js")
		.replace("<<before_remote_exec>>", kill_option ? "await ns.killall(server);" : "")
	);
	ns.run("instance-crawl.js", 1, JSON.stringify({
		// the current host (passed in to save on RamCost)
		host: ns.getHostname(),
		// array of hosts connected through to the current host
		connect_path: [],
		// a host that just finished crawling, used for knowing when to post_exec
		just_finished_crawl: null,
		// list of hosts that are done
		hosts_done: [],
		log: "",
		hops: 0, // just for debugging
		// constant data that doesn't change
		constant: {
			done_file: done_file, // create 'crawldone.txt' when done
			// CONSTANT: a script and args to execute before crawling to a host
			pre_exec: [],
			// CONSTANT: a script and args to execute after done crawling through a host
			post_exec: post_exec,
			// CONSTANT files to copy to the host before executing on it
			files_to_copy: [],
		},
	}));
}
