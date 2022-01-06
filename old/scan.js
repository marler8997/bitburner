/** @param {NS} ns **/
export async function main(ns) {
	ns.rm("hosts.js");
	const pid = ns.run("instance-scan.js", 1, JSON.stringify({
		// the current host (passed in to save on RamCost)
		host: ns.getHostname(),
		// array of hosts connected through to the current host
		connect_path: [],
		// Once a host is done, it's added to the `hosts` object.
		// The key is the hostname and the value is an object with these fields:
		//     scanned: bool
		//     connect_path: string
		// This output object will be saved to hosts.json at the end.
		hosts: {},
		log: "",
		hops: 0, // just for debugging
	}));
	if (pid == 0) {
		ns.alert("scan.js: failed to run 'instance-scan.js'");
	}
}
